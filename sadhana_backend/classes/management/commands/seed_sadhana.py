from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from classes.models import SadhanaClass
from exercises.models import Exercise
from users.models import UserProfile

class Command(BaseCommand):
    help = "Seeds the 5 Sanskrit Sādhanā Classes and the Controlled Exercise Catalog."

    def handle(self, *args, **kwargs):
        self.stdout.write("[INFO] Seeding Sadhana Classes...")

        classes_data = [
            {
                "slug": "yodha",
                "name": "Yodha",
                "sanskrit_name": "योद्धा",
                "domain": "Strength & Power",
                "tagline": "Build power & muscular strength",
                "description": "Yodha focuses on raw muscular power, progressive compound resistance, and structural bone density.",
                "accent_color": "#9b382d",
                "light_color": "#f5e4e1",
                "sun_color": "#e8b6ad"
            },
            {
                "slug": "vistara",
                "name": "Vistāra",
                "sanskrit_name": "विस्तार",
                "domain": "Flexibility & Mobility",
                "tagline": "Move freely & improve mobility",
                "description": "Vistāra focuses on full active range of motion, fascia hydration, and fluid rotational freedom.",
                "accent_color": "#aa4d40",
                "light_color": "#f7e6e3",
                "sun_color": "#eab7af"
            },
            {
                "slug": "sthira",
                "name": "Sthira",
                "sanskrit_name": "स्थिर",
                "domain": "Balance & Core Stability",
                "tagline": "Build stability & body control",
                "description": "Sthira anchors your physical foundation through pelvic-lumbar core control, posture, and mindful balance.",
                "accent_color": "#4b6247",
                "light_color": "#e4ece3",
                "sun_color": "#b8cbb6"
            },
            {
                "slug": "dhruva",
                "name": "Dhruva",
                "sanskrit_name": "ध्रुव",
                "domain": "Cardio & Steadfast Endurance",
                "tagline": "Build stamina & cardiovascular fitness",
                "description": "Dhruva builds your aerobic engine, mitochondrial density, and steadfast physical endurance.",
                "accent_color": "#2b4c7e",
                "light_color": "#dfe8f6",
                "sun_color": "#acc4e6"
            },
            {
                "slug": "samanvaya",
                "name": "Samanvaya",
                "sanskrit_name": "समन्वय",
                "domain": "Coordination & Athletic Agility",
                "tagline": "Move better & connect body and mind",
                "description": "Samanvaya develops neuromuscular agility, multi-planar footwork, and intuitive body-mind connection.",
                "accent_color": "#6d3560",
                "light_color": "#eedfe9",
                "sun_color": "#d9b8d2"
            }
        ]

        class_map = {}
        for cdata in classes_data:
            obj, created = SadhanaClass.objects.update_or_create(
                slug=cdata["slug"],
                defaults=cdata
            )
            class_map[cdata["slug"]] = obj
            status_str = "Created" if created else "Updated"
            self.stdout.write(f"  * {obj.slug}: {status_str}")

        self.stdout.write("\n[EXERCISES] Seeding Controlled Exercise Catalog...")

        exercises_data = [
            # YODHA (Strength)
            {
                "name": "Goblet Squat (Tempo 3-1-1)",
                "class_slug": "yodha",
                "category": "strength",
                "target_muscle": "Quads & Glutes",
                "equipment": "Dumbbells",
                "difficulty": "intermediate",
                "base_xp": 45,
                "default_sets": "4 sets × 10 reps",
                "instructions": "Keep torso tall, drive knees outward, sink to parallel with a controlled 3-second descent."
            },
            {
                "name": "Strict Floor Push-Ups",
                "class_slug": "yodha",
                "category": "strength",
                "target_muscle": "Chest & Triceps",
                "equipment": "Bodyweight",
                "difficulty": "beginner",
                "base_xp": 45,
                "default_sets": "4 sets × 12 reps",
                "instructions": "Maintain rigid core plank, touch chest to floor, lock out elbows at apex."
            },
            {
                "name": "Romanian Dumbbell Deadlifts",
                "class_slug": "yodha",
                "category": "strength",
                "target_muscle": "Hamstrings & Glutes",
                "equipment": "Dumbbells",
                "difficulty": "intermediate",
                "base_xp": 40,
                "default_sets": "3 sets × 10 reps",
                "instructions": "Hinge deeply at hips, keep shins vertical and spine neutral, push hips back until hamstrings load."
            },
            {
                "name": "Hollow Body Core Compression",
                "class_slug": "yodha",
                "category": "strength",
                "target_muscle": "Core & Abs",
                "equipment": "Mat",
                "difficulty": "intermediate",
                "base_xp": 40,
                "default_sets": "3 sets × 45 sec",
                "instructions": "Press lower back firmly into floor, extend arms and legs, hold anti-extension hollow position."
            },
            {
                "name": "Dumbbell Thrusters (Compound Squat-to-Press)",
                "class_slug": "yodha",
                "category": "strength",
                "target_muscle": "Full Body Power",
                "equipment": "Dumbbells",
                "difficulty": "advanced",
                "base_xp": 45,
                "default_sets": "3 sets × 10 reps",
                "instructions": "Deep squat directly transitioning into explosive overhead shoulder press."
            },

            # VISTĀRA (Flexibility)
            {
                "name": "World's Greatest Stretch Flow",
                "class_slug": "vistara",
                "category": "mobility",
                "target_muscle": "Hips & Thoracic Spine",
                "equipment": "Mat",
                "difficulty": "beginner",
                "base_xp": 45,
                "default_sets": "3 sets × 6 reps/side",
                "instructions": "Step into deep lunge, drop inside elbow to floor, then rotate arm open toward ceiling."
            },
            {
                "name": "Pigeon Pose with Active Flutters",
                "class_slug": "vistara",
                "category": "mobility",
                "target_muscle": "Glutes & External Rotators",
                "equipment": "Mat",
                "difficulty": "intermediate",
                "base_xp": 40,
                "default_sets": "3 sets × 45 sec",
                "instructions": "Square hips to floor, oscillate gently through hip joint, sink into exhalations."
            },
            {
                "name": "Cossack Squat Dynamic Shifts",
                "class_slug": "vistara",
                "category": "mobility",
                "target_muscle": "Adductors & Ankles",
                "equipment": "Bodyweight",
                "difficulty": "intermediate",
                "base_xp": 45,
                "default_sets": "3 sets × 8 reps/side",
                "instructions": "Wide stance, shift bodyweight laterally to one heel while keeping opposing leg completely straight."
            },
            {
                "name": "Prone Swimmers & Scapular Waves",
                "class_slug": "vistara",
                "category": "mobility",
                "target_muscle": "Scapula & Rotator Cuff",
                "equipment": "Mat",
                "difficulty": "intermediate",
                "base_xp": 40,
                "default_sets": "3 sets × 12 reps",
                "instructions": "Lie face down, sweep hands from lower back overhead without letting hands touch the ground."
            },

            # STHIRA (Balance)
            {
                "name": "Single-Leg Airplane Balance Holds",
                "class_slug": "sthira",
                "category": "balance",
                "target_muscle": "Foot & Ankle Stability",
                "equipment": "Bodyweight",
                "difficulty": "intermediate",
                "base_xp": 45,
                "default_sets": "3 sets × 40 sec/side",
                "instructions": "Root into standing foot, hinge into T-position, stabilize pelvis without hip tilt."
            },
            {
                "name": "Pallof Anti-Rotation Core Press",
                "class_slug": "sthira",
                "category": "balance",
                "target_muscle": "Deep Obliques & Pelvic Core",
                "equipment": "Band/Cable",
                "difficulty": "beginner",
                "base_xp": 40,
                "default_sets": "3 sets × 12 reps/side",
                "instructions": "Resist rotational pull of band, press hands out directly from sternum and hold 2 seconds."
            },
            {
                "name": "Bird-Dog Isometric Hover",
                "class_slug": "sthira",
                "category": "balance",
                "target_muscle": "Posterior Chain & Core",
                "equipment": "Mat",
                "difficulty": "beginner",
                "base_xp": 40,
                "default_sets": "3 sets × 45 sec",
                "instructions": "From tabletop, reach opposite arm and leg straight out without shifting weight through lumbar spine."
            },
            {
                "name": "Tree Pose to Warrior III Transition",
                "class_slug": "sthira",
                "category": "balance",
                "target_muscle": "Full Body Balance",
                "equipment": "Mat",
                "difficulty": "advanced",
                "base_xp": 45,
                "default_sets": "3 sets × 5 reps/side",
                "instructions": "Flow smoothly from upright Vrikshasana (Tree) into horizontal Virabhadrasana III without foot touching down."
            },

            # DHRUVA (Cardio & Endurance)
            {
                "name": "Tempo Interval Sprints & High Knees",
                "class_slug": "dhruva",
                "category": "endurance",
                "target_muscle": "Aerobic Engine & Calves",
                "equipment": "Bodyweight",
                "difficulty": "intermediate",
                "base_xp": 45,
                "default_sets": "4 rounds × 60 sec",
                "instructions": "Drive knees to hip level with rhythm, pumping arms actively and maintaining smooth nasal breathing."
            },
            {
                "name": "Kettlebell Rhythm Swings",
                "class_slug": "dhruva",
                "category": "endurance",
                "target_muscle": "Posterior Chain Endurance",
                "equipment": "Kettlebell/DB",
                "difficulty": "intermediate",
                "base_xp": 45,
                "default_sets": "4 sets × 15 reps",
                "instructions": "Powerful hip hinge snap, float bell to chest height, sustain consistent cadence."
            },
            {
                "name": "Burpee to Lateral Skater Jump",
                "class_slug": "dhruva",
                "category": "endurance",
                "target_muscle": "Full Body Cardio",
                "equipment": "Bodyweight",
                "difficulty": "advanced",
                "base_xp": 40,
                "default_sets": "3 sets × 10 reps",
                "instructions": "Chest-to-floor burpee, explosive jump up directly into wide lateral bound landing softly."
            },
            {
                "name": "Rhythmic Jump Rope Cadence",
                "class_slug": "dhruva",
                "category": "endurance",
                "target_muscle": "Cardio Conditioning",
                "equipment": "Rope",
                "difficulty": "beginner",
                "base_xp": 40,
                "default_sets": "3 sets × 2 min",
                "instructions": "Stay light on balls of feet, minimal jump height, relaxed shoulders."
            },

            # SAMANVAYA (Coordination)
            {
                "name": "Lateral Bounds with Stick-Landing",
                "class_slug": "samanvaya",
                "category": "agility",
                "target_muscle": "Deceleration & Hips",
                "equipment": "Bodyweight",
                "difficulty": "intermediate",
                "base_xp": 45,
                "default_sets": "4 sets × 8 reps/side",
                "instructions": "Leap laterally off outside leg, land on opposing foot and freeze motion completely for 2 seconds."
            },
            {
                "name": "Quadrupedal Bear Crawl Matrix",
                "class_slug": "samanvaya",
                "category": "agility",
                "target_muscle": "Contralateral Coordination",
                "equipment": "Mat",
                "difficulty": "intermediate",
                "base_xp": 40,
                "default_sets": "3 sets × 45 sec",
                "instructions": "Hover knees 1 inch off floor, advance opposite hand and foot in tight synchrony."
            },
            {
                "name": "4-Square Rhythm Footwork Shuffles",
                "class_slug": "samanvaya",
                "category": "agility",
                "target_muscle": "Neuromuscular Agility",
                "equipment": "Floor Markings",
                "difficulty": "intermediate",
                "base_xp": 45,
                "default_sets": "4 rounds × 30 sec",
                "instructions": "Execute quick in-in-out-out footwork sequences around a 4-square grid pattern."
            },
            {
                "name": "Cross-Body Diagonal Chops",
                "class_slug": "samanvaya",
                "category": "agility",
                "target_muscle": "Rotational Coordination",
                "equipment": "Band/DB",
                "difficulty": "beginner",
                "base_xp": 40,
                "default_sets": "3 sets × 10 reps/side",
                "instructions": "Pivot back foot, swing weight across diagonal plane from high to low with smooth core bracing."
            }
        ]

        for edata in exercises_data:
            eobj, ecreated = Exercise.objects.update_or_create(
                name=edata["name"],
                defaults=edata
            )
            status_str = "Created" if ecreated else "Updated"
            self.stdout.write(f"  * #{eobj.id} [{eobj.class_slug}]: {status_str}")

        # Seed Demo User Arjun
        self.stdout.write("\n[USER] Seeding Demo User 'Arjun'...")
        user, ucreated = User.objects.get_or_create(username="Arjun")
        if ucreated:
            user.set_password("sadhana2026")
            user.save()

        profile, pcreated = UserProfile.objects.get_or_create(user=user)
        profile.name = "Arjun"
        profile.age = 24
        profile.weight_kg = 72.0
        profile.primary_goal = "strength"
        profile.activity_level = "intermediate"
        profile.assigned_class = class_map.get("yodha")
        profile.current_xp = 320
        profile.current_level = 1
        profile.save()

        self.stdout.write(self.style.SUCCESS("[SUCCESS] Successfully seeded Sadhana Core database!"))
