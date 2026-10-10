"""
Deterministic Sādhanā Sanskrit Discipline Classifier.
Classifies users into Sthira, Vistāra, Yodha, Dhruva, or Samanvaya based on biometrics & goals.
"""

def classify_biometrics(age: int, weight_kg: float, primary_goal: str, activity_level: str = "intermediate", name: str = "Seeker") -> dict:
    scores = {
        "yodha": 0,
        "vistara": 0,
        "sthira": 0,
        "dhruva": 0,
        "samanvaya": 0
    }

    # 1. Primary Goal Weight (+70 pts)
    goal = (primary_goal or "").lower()
    if "strength" in goal or "power" in goal or "muscle" in goal:
        scores["yodha"] += 70
        scores["dhruva"] += 15
    elif "flex" in goal or "mobility" in goal:
        scores["vistara"] += 70
        scores["sthira"] += 20
    elif "balance" in goal or "core" in goal or "posture" in goal:
        scores["sthira"] += 70
        scores["vistara"] += 15
    elif "endurance" in goal or "cardio" in goal or "stamina" in goal:
        scores["dhruva"] += 70
        scores["samanvaya"] += 15
    elif "coord" in goal or "agility" in goal or "speed" in goal:
        scores["samanvaya"] += 70
        scores["dhruva"] += 15
    else:
        scores["yodha"] += 40
        scores["sthira"] += 30

    # 2. Age Factor Modulation
    if age >= 45:
        scores["sthira"] += 18   # Joint preservation & core equilibrium
        scores["vistara"] += 14  # Range of motion
    elif age <= 28:
        scores["yodha"] += 10
        scores["samanvaya"] += 10

    # 3. Weight & Mass Loading Factor
    if weight_kg >= 82 and ("strength" in goal or scores["yodha"] > 0):
        scores["yodha"] += 12
    elif weight_kg <= 62 and ("flex" in goal or scores["vistara"] > 0):
        scores["vistara"] += 8

    # 4. Activity & Experience Baseline
    activity = (activity_level or "").lower()
    if activity == "beginner":
        scores["sthira"] += 10  # Foundational stability first
    elif activity == "advanced":
        scores["yodha"] += 8
        scores["samanvaya"] += 8

    # 5. Determine Highest Scoring Archetype
    assigned_class = max(scores, key=scores.get)

    goal_readable = {
        "strength": "muscular strength & physical power",
        "flexibility": "joint mobility & supple movement quality",
        "balance": "core stability & postural alignment",
        "endurance": "cardiovascular stamina & aerobic capacity",
        "coordination": "athletic agility & neuromuscular reflexes"
    }.get(goal, "overall functional fitness")

    rationales = {
        "yodha": f"Based on your profile (Age: {age}, Weight: {weight_kg} kg, Activity: {activity.upper()}) and dedication to {goal_readable}, your neuromuscular baseline is primed for progressive resistance loading. Yodha will systematically develop high-density muscular strength and physical power without risking joint breakdown.",
        "vistara": f"Based on your profile (Age: {age}, Weight: {weight_kg} kg) and aspiration for {goal_readable}, unlocking restricted fascia and restoring full active range-of-motion is your primary physiological leverage. Vistāra will build supple elasticity, healthy joints, and effortless mobility.",
        "sthira": f"Based on your profile (Age: {age}, Weight: {weight_kg} kg) and dedication to {goal_readable}, establishing deep pelvic-lumbar control and rotational balance is vital. Sthira builds an unbreakable physical foundation, preventing injuries and anchoring your posture.",
        "dhruva": f"Based on your profile (Age: {age}, Weight: {weight_kg} kg) and ambition for {goal_readable}, developing mitochondrial density and sustained aerobic output will maximize your stamina. Dhruva trains steadfast endurance and respiratory efficiency.",
        "samanvaya": f"Based on your profile (Age: {age}, Weight: {weight_kg} kg) and drive toward {goal_readable}, linking kinesthetic awareness, rotational torque, and rapid multi-planar footwork is your highest developmental yield. Samanvaya connects body and mind into unified agility."
    }

    class_names = {
        "yodha": "Yodha",
        "vistara": "Vistāra",
        "sthira": "Sthira",
        "dhruva": "Dhruva",
        "samanvaya": "Samanvaya"
    }

    return {
        "assigned_class": assigned_class,
        "class_name": class_names.get(assigned_class, assigned_class.capitalize()),
        "scores": scores,
        "rationale": rationales.get(assigned_class, ""),
        "biometrics": {
            "name": name,
            "age": age,
            "weight_kg": weight_kg,
            "primary_goal": goal,
            "activity_level": activity
        }
    }
