import urllib.request
import json
import sys
from django.core.management.base import BaseCommand
from exercises.models import Exercise

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

DATA_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json"
IMAGE_BASE_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises"

class Command(BaseCommand):
    help = "Imports verified exercises from the open-source Free Exercise DB repository."

    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            default=150,
            help='Max number of exercises to import (default: 150)'
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Import all available exercises in the database'
        )

    def handle(self, *args, **options):
        self.stdout.write("[INFO] Downloading Free Exercise DB dataset...")
        req = urllib.request.Request(DATA_URL, headers={"User-Agent": "Mozilla/5.0"})
        try:
            with urllib.request.urlopen(req) as response:
                raw_data = json.loads(response.read().decode('utf-8'))
        except Exception as e:
            self.stderr.write(f"[ERROR] Failed to fetch exercises dataset: {e}")
            return

        self.stdout.write(f"[INFO] Fetched {len(raw_data)} exercises. Processing and classifying into Sadhana disciplines...")

        limit = None if options['all'] else options['limit']

        counts = {
            "yodha": 0,
            "vistara": 0,
            "sthira": 0,
            "dhruva": 0,
            "samanvaya": 0
        }

        # Precise equipment taxonomy to prevent machine/gym gear leakage into Bodyweight
        supported_equipment = {
            "body only": "Bodyweight",
            "dumbbell": "Dumbbells",
            "barbell": "Barbell",
            "e-z curl bar": "Barbell",
            "kettlebells": "Kettlebell",
            "cable": "Cable",
            "machine": "Machine",
            "bands": "Resistance Bands",
            "medicine ball": "Medicine Ball",
            "exercise ball": "Stability Ball",
            "foam roll": "Foam Roller",
            None: "Bodyweight",
            "": "Bodyweight"
        }

        imported_count = 0

        for ex in raw_data:
            if limit and imported_count >= limit:
                break

            name = ex.get("name", "").strip()
            if not name:
                continue

            raw_equip = ex.get("equipment")
            if raw_equip == "other":
                name_l = name.lower()
                if any(w in name_l for w in ["stone", "sled", "tire", "rope", "roller", "board", "bar", "band", "bench", "weight", "plate", "sandbag", "chain", "harness", "axle", "log", "yoke", "weighted", "rings", "ring dips"]):
                    equip_str = "Gym Equipment"
                else:
                    equip_str = "Bodyweight"
            else:
                equip_str = supported_equipment.get(raw_equip, "Gym Equipment")

            # Title-based hygiene filter: detect equipment mentioned in exercise name
            name_lower = name.lower()
            if any(w in name_lower for w in ["barbell", "plate", "bench press", "axle", "trap bar"]):
                equip_str = "Barbell"
            elif any(w in name_lower for w in ["dumbbell", "db "]):
                equip_str = "Dumbbells"
            elif any(w in name_lower for w in ["kettlebell", "circus bell"]):
                equip_str = "Kettlebell"
            elif any(w in name_lower for w in ["smith machine", "machine"]):
                equip_str = "Machine"
            elif any(w in name_lower for w in ["sled", "prowler", "sandbag", "atlas stone", "tire flip", "battling ropes", "wrist roller"]):
                equip_str = "Gym Equipment"

            cat = (ex.get("category") or "").lower()
            name_lower = name.lower()
            muscles = [m.lower() for m in ex.get("primaryMuscles", [])]
            primary_muscle = muscles[0].capitalize() if muscles else "Full Body"
            force = ex.get("force") or ""
            mechanic = ex.get("mechanic") or ""
            level = ex.get("level") or "intermediate"

            # 1. Discipline Classification Logic
            if cat == "stretching" or any(w in name_lower for w in ["stretch", "foam roll", "mobility", "yoga", "pose"]):
                class_slug = "vistara"
            elif "abdominals" in muscles or "lower back" in muscles or any(w in name_lower for w in ["plank", "dead bug", "bird dog", "hollow", "bridge", "stability ball", "side bridge", "pallof", "vacuum", "sit-up", "crunch"]):
                class_slug = "sthira"
            elif cat == "cardio" or any(w in name_lower for w in ["burpee", "mountain climber", "jumping jack", "jump rope", "rowing", "run", "sprint", "high knees", "butt kick"]):
                class_slug = "dhruva"
            elif cat == "plyometrics" or any(w in name_lower for w in ["jump", "hop", "box jump", "lateral", "bound", "agility", "slam", "tuck"]):
                class_slug = "samanvaya"
            else:
                class_slug = "yodha"

            # 2. Base XP Calculation
            base_xp = 35 if level == "beginner" else (55 if level == "expert" else 45)
            if mechanic == "compound":
                base_xp += 5

            # 3. Default Sets & Reps
            if class_slug == "vistara":
                default_sets = "3 sets × 45 sec hold"
            elif class_slug == "sthira":
                default_sets = "3 sets × 40 sec hold" if "plank" in name_lower or "hold" in name_lower else "3 sets × 12 reps"
            elif class_slug == "dhruva":
                default_sets = "4 rounds × 45 sec"
            elif class_slug == "samanvaya":
                default_sets = "4 sets × 6 reps (Explosive)"
            else:
                default_sets = "4 sets × 8 reps" if mechanic == "compound" else "3 sets × 10 reps"

            # 4. Images
            images = ex.get("images", [])
            img_0 = f"{IMAGE_BASE_URL}/{images[0]}" if len(images) > 0 else ""
            img_1 = f"{IMAGE_BASE_URL}/{images[1]}" if len(images) > 1 else ""

            # 5. Instructions
            instructions_list = ex.get("instructions", [])
            instructions_text = "\n".join(instructions_list) if isinstance(instructions_list, list) else str(instructions_list)

            # 6. Database Persistence
            Exercise.objects.update_or_create(
                name=name,
                defaults={
                    "class_slug": class_slug,
                    "category": cat or "strength",
                    "target_muscle": primary_muscle,
                    "equipment": equip_str,
                    "difficulty": level,
                    "force": force,
                    "mechanic": mechanic,
                    "image_url_0": img_0,
                    "image_url_1": img_1,
                    "base_xp": base_xp,
                    "default_sets": default_sets,
                    "instructions": instructions_text
                }
            )

            counts[class_slug] += 1
            imported_count += 1

        self.stdout.write(self.style.SUCCESS(f"\n[SUCCESS] Imported {imported_count} verified exercises from Free Exercise DB!"))
        self.stdout.write("Discipline Distribution:")
        for slug, cnt in counts.items():
            self.stdout.write(f"  • {slug.upper()}: {cnt} exercises")
