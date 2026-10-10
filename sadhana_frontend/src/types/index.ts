export interface SadhanaClass {
  id?: number;
  slug: string;
  name: string;
  sanskrit_name: string;
  core_focus: string;
  description: string;
  accent_color: string;
  radar_weights?: Record<string, number>;
}

export interface BiometricEvaluationRequest {
  name: string;
  age: number;
  weight_kg: number;
  primary_goal: string;
  activity_level: string;
  available_days?: number;
  session_time?: number;
  equipment?: string[];
  limitations?: string[];
}

export interface BiometricEvaluationResponse {
  assigned_class: string;
  rationale: string;
  component_scores?: Record<string, number>;
  class_details?: SadhanaClass;
}

export interface UserProfile {
  id?: number;
  username?: string;
  email?: string;
  name: string;
  age: number;
  weight_kg: number;
  primary_goal: string;
  activity_level: string;
  assigned_class?: SadhanaClass | null;
  assigned_class_slug?: string;
  current_xp: number;
  current_level: number;
  aura_score: number;
  current_streak?: number;
  streak?: number;
  total_aura?: number;
  workouts_completed_count?: number;
  archetype?: string;
  level?: number;
  xp?: number;
  equipment_access?: string[];
  limitations?: string[];
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
  message?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  name?: string;
}

export interface ExerciseDetails {
  id: number;
  name: string;
  category?: string;
  target_muscle?: string;
  equipment?: string;
  difficulty?: string;
  force?: string;
  mechanic?: string;
  image_url_0?: string;
  image_url_1?: string;
  instructions?: string;
  base_xp?: number;
}

export interface ExerciseItem {
  id: number;
  name?: string;
  exercise_name?: string;
  sanskrit_name?: string;
  sets_reps?: string;
  sets?: number;
  reps?: string | number;
  order?: number;
  completed: boolean;
  xp_reward: number;
  exercise?: number;
  exercise_details?: ExerciseDetails;
  focus_archetype?: string;
  image_url_0?: string;
  image_url_1?: string;
  video_url?: string;
  muscle_group?: string;
  target_muscle?: string;
  category?: string;
  equipment?: string;
  instructions?: string;
  duration_seconds?: number;
}

export interface WorkoutPlan {
  id: number;
  title: string;
  plan_name?: string;
  class_slug: string;
  archetype?: string;
  duration_minutes: number;
  target_duration?: number;
  target_equipment?: string;
  description?: string;
  is_ai_adapted: boolean;
  created_at?: string;
  exercises: ExerciseItem[];
}

export interface SystemHealth {
  status: string;
  service: string;
  database: string;
  classes: Array<{ name: string; domain: string }>;
  version: string;
}

declare global {
  interface Window {
    google?: any;
  }
}
