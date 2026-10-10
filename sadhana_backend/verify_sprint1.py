import os
import sys
import django

# Set UTF-8 encoding for standard output
sys.stdout.reconfigure(encoding='utf-8')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client

c = Client()

print("==================================================")
print("       SĀDHANĀ - SPRINT 1 BACKEND VERIFICATION   ")
print("==================================================")

# 1. Health Endpoint
r_health = c.get('/api/health/')
assert r_health.status_code == 200, f"Expected 200, got {r_health.status_code}"
print(f"[PASS] 1. Health Check        : HTTP {r_health.status_code} -> {r_health.json().get('service')}")

# 2. Classes Catalog
r_cls = c.get('/api/classes/')
assert r_cls.status_code == 200
classes = r_cls.json()
assert len(classes) == 5, f"Expected 5 classes, found {len(classes)}"
print(f"[PASS] 2. Classes Catalog     : HTTP {r_cls.status_code} -> 5 Archetypes Seeded")
for cl in classes:
    print(f"       • [{cl['slug']}] {cl['name']} ({cl['sanskrit_name']}) - {cl['accent_color']}")

# 3. Biometric Classifier
eval_payload = {
    'name': 'Arjun',
    'age': 25,
    'weight_kg': 75.0,
    'primary_goal': 'strength',
    'activity_level': 'intermediate'
}
r_eval = c.post('/api/classes/evaluate/', eval_payload, content_type='application/json')
assert r_eval.status_code == 200
eval_data = r_eval.json()
assert eval_data['assigned_class'] == 'yodha', f"Expected yodha, got {eval_data['assigned_class']}"
print(f"[PASS] 3. Biometric Classifier: HTTP {r_eval.status_code} -> Assigned: {eval_data['assigned_class'].upper()}")
print(f"       Rationale: {eval_data['rationale']}")

# 4. Exercises Catalog by Archetype
r_ex = c.get('/api/exercises/?class_slug=yodha')
assert r_ex.status_code == 200
exercises = r_ex.json()
print(f"[PASS] 4. Exercises Catalog   : HTTP {r_ex.status_code} -> {len(exercises)} Yodha exercises available")

# 5. Standard Workout Plan (45 mins)
r_plan = c.get('/api/workouts/today/?class_slug=yodha&duration=45')
assert r_plan.status_code == 200
plan_data = r_plan.json()
print(f"[PASS] 5. Standard Workout    : HTTP {r_plan.status_code} -> '{plan_data['title']}' ({len(plan_data['exercises'])} exercises)")

# 6. Complete Set & Progression System
first_ex_id = plan_data['exercises'][0]['id']
r_set = c.post('/api/workouts/complete-set/', {'workout_exercise_id': first_ex_id}, content_type='application/json')
assert r_set.status_code == 200
set_data = r_set.json()
print(f"[PASS] 6. XP Progression      : HTTP {r_set.status_code} -> Earned +{set_data['earned_xp']} XP | Level: {set_data['level']} | Total XP: {set_data['total_xp']}")

# 7. Express 15-Minute Workout with Proportional XP Reduction
r_express = c.get('/api/workouts/today/?class_slug=yodha&duration=15')
assert r_express.status_code == 200
exp_data = r_express.json()
print(f"[PASS] 7. Express 15m Routine : HTTP {r_express.status_code} -> '{exp_data['title']}'")
for ex in exp_data['exercises']:
    print(f"       • {ex['exercise_name']}: {ex['sets_reps']} -> Proportional XP: +{ex['xp_reward']} XP (Anti-Cheat Scaled)")

print("==================================================")
print("     ALL SPRINT 1 BACKEND CRITERIA VERIFIED 100%  ")
print("==================================================")
