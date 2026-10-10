from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from .models import WorkoutPlan, WorkoutExercise
from .serializers import WorkoutPlanSerializer, WorkoutExerciseSerializer
from exercises.models import Exercise

class TodayWorkoutView(APIView):
    permission_classes = [AllowAny]

    def get_allowed_equipment(self, user_equip_list):
        # Base bodyweight / mat exercises are always accessible
        allowed = {'Bodyweight', 'Mat', 'None', '', 'Floor Markings'}
        if not user_equip_list:
            return list(allowed)

        norm = [e.lower().strip() for e in user_equip_list]
        if 'all' in norm or 'gym' in norm:
            return None  # No restrictions

        if 'dumbbells' in norm or 'dumbbell' in norm:
            allowed.add('Dumbbells')
        if 'barbell' in norm:
            allowed.add('Barbell')
        if 'kettlebell' in norm or 'kettlebells' in norm:
            allowed.add('Kettlebell')
            allowed.add('Kettlebell/DB')
        if 'resistance_bands' in norm or 'bands' in norm:
            allowed.add('Resistance Bands')
            allowed.add('Band/Cable')
            allowed.add('Band/DB')
        if 'cable' in norm:
            allowed.add('Cable')
            allowed.add('Band/Cable')
        if 'pullup_bar' in norm:
            allowed.add('Bodyweight')

        return list(allowed)

    def get(self, request):
        from users.models import UserProfile

        class_slug = request.query_params.get('class_slug', 'yodha')
        duration = int(request.query_params.get('duration', 45))
        is_adapted = duration <= 20
        force_new = request.query_params.get('refresh') == 'true'
        if request.user and request.user.is_authenticated:
            username = request.user.username
        else:
            username = request.query_params.get('username')

        # Determine user equipment access
        equipment_param = request.query_params.get('equipment')
        if equipment_param:
            user_equipment = [e.strip() for e in equipment_param.split(',') if e.strip()]
        elif username:
            profile = UserProfile.objects.filter(user__username=username).first()
            if profile and profile.equipment_access:
                user_equipment = profile.equipment_access
            else:
                user_equipment = ['bodyweight']
        else:
            user_equipment = ['bodyweight']

        allowed_equipment = self.get_allowed_equipment(user_equipment)

        plan = None
        if not force_new:
            candidate = WorkoutPlan.objects.filter(
                class_slug=class_slug,
                duration_minutes=duration,
                is_ai_adapted=is_adapted
            ).last()

            # Verify candidate matches equipment restrictions and has images
            if candidate and candidate.exercises.count() > 0:
                has_images = bool(candidate.exercises.first().exercise.image_url_0)
                if allowed_equipment is not None:
                    equipment_compliant = all(
                        we.exercise.equipment in allowed_equipment for we in candidate.exercises.all()
                    )
                else:
                    equipment_compliant = True

                if has_images and equipment_compliant:
                    plan = candidate

        if not plan:
            plan = self.generate_default_plan(class_slug, duration, allowed_equipment)

        return Response(WorkoutPlanSerializer(plan).data)

    def generate_default_plan(self, class_slug: str, duration: int, allowed_equipment: list = None) -> WorkoutPlan:
        is_adapted = duration <= 20
        title = f"{class_slug.capitalize()} Express Practice" if is_adapted else f"Daily {class_slug.capitalize()} Sādhanā"
        
        plan = WorkoutPlan.objects.create(
            title=title,
            class_slug=class_slug,
            duration_minutes=duration,
            is_ai_adapted=is_adapted
        )

        import random

        # Helper to query pool with allowed equipment
        def filter_pool(slug):
            qs = Exercise.objects.filter(class_slug=slug)
            if allowed_equipment is not None:
                qs = qs.filter(equipment__in=allowed_equipment)
            pool = list(qs.exclude(image_url_0=""))
            if not pool:
                pool = list(qs)
            return pool

        # 1. Primary discipline pool strictly respecting equipment
        primary_pool = filter_pool(class_slug)
        if not primary_pool:
            # Fallback if no equipment matches for this class: search any bodyweight exercises for class
            primary_pool = list(Exercise.objects.filter(class_slug=class_slug, equipment__in=['Bodyweight', 'Mat', 'None', '']))
        if not primary_pool:
            primary_pool = list(Exercise.objects.filter(class_slug=class_slug))

        # 2. Supporting pools for balanced development (ADR-001)
        mobility_pool = filter_pool("vistara")
        core_pool = filter_pool("sthira")

        selected = []

        if is_adapted:
            # 15m Express: 2 high-impact compound movements
            compound_primary = [e for e in primary_pool if e.mechanic == "compound"] or primary_pool
            sample_primary = random.sample(compound_primary, min(2, len(compound_primary)))
            selected.extend(sample_primary)
        else:
            # 45m Full Sādhanā Structure:
            # Warm-up (Mobility) -> 2 Primary Class Lifts -> 1 Supporting Core/Stability -> 1 Finisher
            if mobility_pool and class_slug != "vistara":
                selected.append(random.choice(mobility_pool))

            compound_primary = [e for e in primary_pool if e.mechanic == "compound"] or primary_pool
            sample_count = 3 if class_slug == "vistara" else 2
            selected.extend(random.sample(compound_primary, min(sample_count, len(compound_primary))))

            if core_pool and class_slug != "sthira":
                selected.append(random.choice(core_pool))

            # Additional accessory from primary pool
            remaining = [e for e in primary_pool if e not in selected]
            if remaining:
                selected.append(random.choice(remaining))

        # Persist WorkoutExercise items
        for idx, ex in enumerate(selected, 1):
            if is_adapted:
                reduced_xp = max(20, round(ex.base_xp * (duration / 45.0)))
                sets_reps = "3 sets × 8 reps" if ex.mechanic == "compound" else "3 sets × 10 reps"
                xp = reduced_xp
            else:
                sets_reps = ex.default_sets or "3 sets × 10 reps"
                xp = ex.base_xp

            WorkoutExercise.objects.create(
                workout=plan,
                exercise=ex,
                order=idx,
                sets_reps=sets_reps,
                xp_reward=xp
            )

        return plan

class ToggleExerciseCompleteView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        workout_exercise_id = request.data.get('workout_exercise_id')

        we = WorkoutExercise.objects.filter(id=workout_exercise_id).first()
        if not we:
            return Response({"error": "Workout exercise not found"}, status=status.HTTP_404_NOT_FOUND)

        we.completed = not we.completed
        we.save()

        # Update user profile XP if user exists
        if request.user and request.user.is_authenticated:
            user = request.user
        else:
            username = request.data.get('username')
            user = User.objects.filter(username=username).first() if username else None
        xp_result = None
        if user and hasattr(user, 'profile'):
            if we.completed:
                xp_result = user.profile.add_xp(we.xp_reward)
            else:
                user.profile.current_xp = max(0, user.profile.current_xp - we.xp_reward)
                user.profile.save()
                xp_result = {"new_xp": user.profile.current_xp, "new_level": user.profile.current_level, "leveled_up": False}

        return Response({
            "exercise": WorkoutExerciseSerializer(we).data,
            "xp_result": xp_result
        }, status=status.HTTP_200_OK)
