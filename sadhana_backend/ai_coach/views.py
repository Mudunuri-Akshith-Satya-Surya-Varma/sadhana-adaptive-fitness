import os
import json
import urllib.request
import urllib.error
from pathlib import Path
from dotenv import load_dotenv
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from exercises.models import Exercise
from workouts.models import WorkoutPlan, WorkoutExercise
from workouts.serializers import WorkoutPlanSerializer

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env', override=True)

SAI_SYSTEM_INSTRUCTION = """
You are sAI (Sādhanā AI Coach), the revered AI fitness companion, biomechanics mentor, and philosophical guide of the Sādhanā gamified fitness platform.

You operate in TWO MODES based on user intent:

MODE 1: CONVERSATIONAL CHAT & FITNESS GUIDANCE (Default):
- When the warrior greets you, introduce yourself warmly and respectfully in character as sAI, ask how their energy and body feel today, and ask if they are ready to train or need guidance.
- When the warrior asks questions about exercise technique, posture, diet, recovery, motivation, muscle soreness, or Sādhanā lore:
  Provide clear, encouraging, biomechanically accurate answers.
- In this mode, you MUST set:
  "intent": "chat",
  "adapted": false,
  "selected_exercise_ids": [],
  "biomechanical_rationale": ""

MODE 2: WORKOUT ADAPTATION & NODE SELECTION:
- ONLY activate this mode when the warrior explicitly asks to modify, shorten, lengthen, or adjust their training quest (e.g., reports joint pain/injury, asks for a 15-20 min express routine, requests specific equipment swaps like dumbbells, or asks to change their exercises).
- In this mode:
  1. Select 3-5 exercise IDs strictly from the provided candidate list that honor the warrior's physiological constraints and discipline archetype.
  2. If user reports knee pain: Eliminate squats, lunges, and jumping; substitute hip extension and core/upper body.
  3. If user reports lower back pain: Eliminate heavy axial spinal loads.
  4. If user requests express/short: Select 2-3 high-density compound movements.
- Set:
  "intent": "adapt_workout",
  "adapted": true,
  "duration_minutes": <number: 15, 20, 30, 45>,
  "selected_exercise_ids": [<list of integer IDs from candidates>],
  "biomechanical_rationale": "Brief technical note on why these exercises were chosen."

STRICT OUTPUT FORMAT:
Respond strictly in valid JSON matching this schema:
{
  "intent": "chat" | "adapt_workout",
  "coaching_reply": "Your conversational answer to the warrior",
  "adapted": false | true,
  "duration_minutes": null | <number>,
  "selected_exercise_ids": [<list of IDs or empty array>],
  "biomechanical_rationale": "explanation or empty string"
}
"""

def normalize_equipment_whitelist(user_equip_list):
    allowed = {'Bodyweight', 'Mat', 'None', '', 'Floor Markings'}
    if not user_equip_list:
        return list(allowed)

    norm = [e.lower().strip() for e in user_equip_list]
    if 'all' in norm or 'gym' in norm:
        return None  # All equipment

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

def call_gemini_ai(prompt: str, system_instruction: str, api_key: str):
    """
    Directly queries Google Gemini API using active flash models.
    Tries gemini-3.5-flash first, falling back to gemini-3.7-flash and gemini-3.8-flash.
    Guarantees strict JSON output through response_mime_type.
    """
    models = ['gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-3.8-flash']
    last_error = None

    payload_data = {
        "system_instruction": {"parts": [{"text": system_instruction}]},
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.7
        }
    }
    encoded_payload = json.dumps(payload_data).encode('utf-8')

    for model in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        req = urllib.request.Request(
            url,
            data=encoded_payload,
            headers={"Content-Type": "application/json"}
        )
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                raw_text = data['candidates'][0]['content']['parts'][0]['text']
                parsed = json.loads(raw_text)
                parsed["model_used"] = model
                print(f"[sAI Coach] Live Gemini AI success using {model}! Intent={parsed.get('intent')}, Adapted={parsed.get('adapted')}", flush=True)
                return parsed
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8', errors='ignore')
            last_error = f"Model {model} HTTP {e.code}: {err_body[:200]}"
            print(f"[sAI Coach] {last_error}", flush=True)
            continue
        except Exception as e:
            last_error = f"Model {model} error: {str(e)}"
            print(f"[sAI Coach] {last_error}", flush=True)
            continue

    raise RuntimeError(f"All Gemini AI models unavailable. Details: {last_error}")

class AiCoachChatView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user_message = request.data.get('message', '').strip()
        class_slug = request.data.get('class_slug', 'yodha').lower()
        duration = int(request.data.get('duration', 45))

        # Dynamically resolve user identity: authenticated user takes priority
        if request.user and request.user.is_authenticated:
            if hasattr(request.user, 'profile') and request.user.profile.name:
                username = request.user.profile.name
            else:
                username = request.user.first_name or request.user.username
        else:
            username = request.data.get('username') or 'Warrior'

        equipment_raw = request.data.get('equipment', 'bodyweight')
        if isinstance(equipment_raw, list):
            user_equip_list = equipment_raw
        else:
            user_equip_list = [e.strip() for e in str(equipment_raw).split(',') if e.strip()]

        allowed_equipment = normalize_equipment_whitelist(user_equip_list)

        load_dotenv(BASE_DIR / '.env', override=True)
        gemini_api_key = os.getenv('GEMINI_API_KEY', '').strip()

        if not gemini_api_key:
            return Response({
                "error": "Gemini API key is not configured.",
                "reply": "sAI neural link is offline: GEMINI_API_KEY is not configured.",
                "adapted": False,
                "plan": None
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        # Handle empty/greeting prompt dynamically
        effective_message = user_message if user_message else "Hello! Greet me warmly as my AI fitness coach and ask how I feel today."

        # Fetch candidate exercises from database matching user equipment and class
        qs = Exercise.objects.filter(class_slug=class_slug)
        if allowed_equipment is not None:
            qs = qs.filter(equipment__in=allowed_equipment)
        candidates = list(qs.exclude(image_url_0="")[:25])
        if not candidates:
            candidates = list(qs[:25])

        candidate_data = [
            {
                "id": e.id,
                "name": e.name,
                "muscle": e.target_muscle,
                "equipment": e.equipment,
                "mechanic": e.mechanic
            }
            for e in candidates
        ]

        prompt = f"""
WARRIOR PROFILE:
- Name: {username}
- Discipline: {class_slug}
- Planned Duration: {duration} minutes
- Equipment Whitelist: {user_equip_list}

WARRIOR INPUT:
"{effective_message}"

AVAILABLE DATABASE CANDIDATE EXERCISES:
{json.dumps(candidate_data, indent=2)}

Analyze the warrior's message:
- If it is a greeting, conversational chat, or fitness/form/nutrition/recovery question:
  Respond warmly, respectfully, and insightfully addressed to {username} with "intent": "chat", "adapted": false, "selected_exercise_ids": [], "biomechanical_rationale": "".
- ONLY if the warrior explicitly asks to change, adapt, shorten, or modify their workout or reports pain/injury:
  Select 3-5 candidate exercise IDs and set "intent": "adapt_workout", "adapted": true, "duration_minutes": <number>, "selected_exercise_ids": [<ids>], "biomechanical_rationale": "<technical explanation>".

Keep responses direct, empowering, and under 100 words. Respond strictly in valid JSON matching your system instructions.
"""

        try:
            ai_result = call_gemini_ai(prompt, SAI_SYSTEM_INSTRUCTION, gemini_api_key)
        except Exception as e:
            print(f"[sAI Coach] AI Integration failure: {e}", flush=True)
            return Response({
                "error": str(e),
                "reply": "I am currently unable to reach my core AI stream. Please verify your network connection and API status, warrior.",
                "adapted": False,
                "plan": None
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        is_adapted = ai_result.get("adapted", False)
        coaching_reply = ai_result.get("coaching_reply", "")

        # If user is just chatting or asking guidance (NOT adapting workout)
        if not is_adapted:
            return Response({
                "reply": coaching_reply,
                "adapted": False,
                "plan": None,
                "duration": duration,
                "rationale": ""
            }, status=status.HTTP_200_OK)

        # User requested workout adaptation: build WorkoutPlan & WorkoutExercise dynamically based strictly on AI selection
        target_duration = ai_result.get("duration_minutes", duration) or duration
        selected_ids = ai_result.get("selected_exercise_ids", [])

        exercises = []
        for eid in selected_ids:
            ex = Exercise.objects.filter(id=eid).first()
            if ex and ex not in exercises:
                exercises.append(ex)

        if not exercises:
            exercises = list(Exercise.objects.filter(class_slug=class_slug)[:4])

        plan_title = f"{class_slug.capitalize()} Express Practice" if target_duration <= 20 else f"Daily {class_slug.capitalize()} Sādhanā"

        new_plan = WorkoutPlan.objects.create(
            title=plan_title,
            class_slug=class_slug,
            duration_minutes=target_duration,
            is_ai_adapted=True
        )

        for idx, ex in enumerate(exercises, 1):
            if target_duration <= 20:
                reduced_xp = max(20, round(ex.base_xp * (target_duration / 45.0)))
                sets_reps = "3 sets × 8 reps" if ex.mechanic == "compound" else "3 sets × 10 reps"
                xp = reduced_xp
            else:
                sets_reps = ex.default_sets or "3 sets × 10 reps"
                xp = ex.base_xp

            WorkoutExercise.objects.create(
                workout=new_plan,
                exercise=ex,
                order=idx,
                sets_reps=sets_reps,
                xp_reward=xp
            )

        return Response({
            "reply": coaching_reply,
            "duration": target_duration,
            "adapted": True,
            "rationale": ai_result.get("biomechanical_rationale", ""),
            "plan": WorkoutPlanSerializer(new_plan).data
        }, status=status.HTTP_200_OK)
