import axios from 'axios';
import type {
  SystemHealth,
  SadhanaClass,
  BiometricEvaluationRequest,
  BiometricEvaluationResponse,
  WorkoutPlan,
  UserProfile,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sadhana_token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Sādhanā API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const checkHealth = async (): Promise<SystemHealth> => {
  const res = await api.get<SystemHealth>('/health/');
  return res.data;
};

export const fetchClasses = async (): Promise<SadhanaClass[]> => {
  const res = await api.get<SadhanaClass[]>('/classes/');
  return res.data;
};

export const evaluateBiometrics = async (
  payload: BiometricEvaluationRequest
): Promise<BiometricEvaluationResponse> => {
  const res = await api.post<BiometricEvaluationResponse>('/classes/evaluate/', payload);
  return res.data;
};

export const getTodayWorkout = async (
  classSlug: string = 'yodha',
  duration: number = 45,
  equipment?: string,
  refresh: boolean = false
): Promise<WorkoutPlan> => {
  let url = `/workouts/today/?class_slug=${classSlug}&duration=${duration}`;
  if (equipment) url += `&equipment=${encodeURIComponent(equipment)}`;
  if (refresh) url += `&refresh=true`;
  const res = await api.get<WorkoutPlan>(url);
  return res.data;
};

export const chatWithAiCoach = async (payload: {
  message: string;
  class_slug: string;
  duration?: number;
  equipment?: string;
  username?: string;
}): Promise<{
  reply: string;
  duration?: number;
  adapted: boolean;
  rationale?: string;
  plan: WorkoutPlan;
}> => {
  const res = await api.post('/ai-coach/chat/', payload, { timeout: 60000 });
  return res.data;
};

export const toggleCompleteExercise = async (
  workoutExerciseId: number,
  username?: string
): Promise<{ exercise: any; xp_result: { new_xp: number; new_level: number; leveled_up: boolean } | null }> => {
  const payload: any = { workout_exercise_id: workoutExerciseId };
  if (username) payload.username = username;
  const res = await api.post('/workouts/complete-set/', payload);
  return res.data;
};

export const getUserProfile = async (username?: string): Promise<UserProfile> => {
  const url = username ? `/users/profile/?username=${username}` : '/users/profile/';
  const res = await api.get<UserProfile>(url);
  return res.data;
};

export const saveUserProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
  const res = await api.post<UserProfile>('/users/profile/', data);
  return res.data;
};

// Authentication Endpoints
export const registerUser = async (data: RegisterPayload): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/users/register/', data);
  return res.data;
};

export const loginUser = async (data: LoginPayload): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/users/login/', data);
  return res.data;
};

export const logoutUser = async (): Promise<void> => {
  try {
    await api.post('/users/logout/');
  } finally {
    localStorage.removeItem('sadhana_token');
    localStorage.removeItem('sadhana_active_user');
  }
};

export const getCurrentUser = async (): Promise<UserProfile> => {
  const res = await api.get<UserProfile>('/users/me/');
  return res.data;
};

export const loginDemoUser = async (): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/users/demo-login/');
  return res.data;
};

export const googleLoginUser = async (credential: string): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/users/google-login/', { credential });
  return res.data;
};

export default api;
