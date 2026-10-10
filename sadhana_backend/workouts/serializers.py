from rest_framework import serializers
from .models import WorkoutPlan, WorkoutExercise
from exercises.serializers import ExerciseSerializer

class WorkoutExerciseSerializer(serializers.ModelSerializer):
    exercise_details = ExerciseSerializer(source='exercise', read_only=True)
    name = serializers.CharField(source='exercise.name', read_only=True, default='')
    exercise_name = serializers.CharField(source='exercise.name', read_only=True, default='')
    image_url_0 = serializers.CharField(source='exercise.image_url_0', read_only=True, default='')
    image_url_1 = serializers.CharField(source='exercise.image_url_1', read_only=True, default='')
    instructions = serializers.CharField(source='exercise.instructions', read_only=True, default='')
    target_muscle = serializers.CharField(source='exercise.target_muscle', read_only=True, default='')
    equipment = serializers.CharField(source='exercise.equipment', read_only=True, default='')
    category = serializers.CharField(source='exercise.category', read_only=True, default='')

    class Meta:
        model = WorkoutExercise
        fields = [
            'id', 'order', 'sets_reps', 'xp_reward', 'completed', 'exercise',
            'exercise_details', 'name', 'exercise_name', 'image_url_0',
            'image_url_1', 'instructions', 'target_muscle', 'equipment', 'category'
        ]

class WorkoutPlanSerializer(serializers.ModelSerializer):
    exercises = WorkoutExerciseSerializer(many=True, read_only=True)
    total_xp = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutPlan
        fields = ['id', 'title', 'class_slug', 'duration_minutes', 'is_ai_adapted', 'status', 'created_at', 'exercises', 'total_xp']

    def get_total_xp(self, obj):
        return obj.total_xp()
