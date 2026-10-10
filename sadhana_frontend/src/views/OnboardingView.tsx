import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { evaluateBiometrics, saveUserProfile } from '../services/api';
import { useApp } from '../context/AppContext';
import type { BiometricEvaluationRequest, BiometricEvaluationResponse } from '../types';
import {
  Shield,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  Dumbbell,
  Target,
  Heart,
  Wind,
  Zap,
} from 'lucide-react';

export const OnboardingView: React.FC = () => {
  const navigate = useNavigate();
  const { profile, isAuthenticated, setProfile } = useApp();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<BiometricEvaluationRequest>({
    name: profile?.name || profile?.username || 'Warrior',
    age: profile?.age || 24,
    weight_kg: profile?.weight_kg || 75.0,
    primary_goal: profile?.primary_goal || 'strength',
    activity_level: profile?.activity_level || 'intermediate',
    available_days: 4,
    session_time: 45,
    equipment: profile?.equipment_access?.length ? profile.equipment_access : ['bodyweight'],
    limitations: profile?.limitations || [],
  });

  const goals = [
    {
      id: 'strength',
      name: 'Strength & Muscular Power',
      desc: 'Build raw force, muscle density, and resistance mastery.',
      archetypeHint: 'Yodha',
      icon: <Dumbbell className="w-5 h-5 text-[#A52A2A]" />,
    },
    {
      id: 'flexibility',
      name: 'Flexibility & Movement Quality',
      desc: 'Unlock deep joint mobility, posture, and flow.',
      archetypeHint: 'Vistāra',
      icon: <Wind className="w-5 h-5 text-[#D99A16]" />,
    },
    {
      id: 'balance',
      name: 'Balance & Core Stability',
      desc: 'Solidify equilibrium, midline bracing, and single-leg control.',
      archetypeHint: 'Sthira',
      icon: <Target className="w-5 h-5 text-[#38764A]" />,
    },
    {
      id: 'endurance',
      name: 'Cardio & Steadfast Stamina',
      desc: 'Develop aerobic capacity, work capacity, and steady grit.',
      archetypeHint: 'Dhruva',
      icon: <Heart className="w-5 h-5 text-[#176B87]" />,
    },
    {
      id: 'coordination',
      name: 'Coordination & Athletic Agility',
      desc: 'Integrate multi-planar speed, balance-power transfer, and reflexes.',
      archetypeHint: 'Samanvaya',
      icon: <Zap className="w-5 h-5 text-[#54B7B0]" />,
    },
  ];

  const experienceLevels = [
    { id: 'beginner', label: 'Initiate (0-1 yrs)', desc: 'Learning form & fundamental movement patterns' },
    { id: 'intermediate', label: 'Practitioner (1-3 yrs)', desc: 'Consistent training, solid movement foundation' },
    { id: 'advanced', label: 'Adept (3+ yrs)', desc: 'High work capacity, refining advanced adaptations' },
  ];

  const equipmentOptions = [
    { id: 'bodyweight', label: 'Bodyweight Only' },
    { id: 'dumbbells', label: 'Dumbbells' },
    { id: 'barbell', label: 'Barbell & Plates' },
    { id: 'pullup_bar', label: 'Pull-up Bar' },
    { id: 'kettlebell', label: 'Kettlebells' },
    { id: 'resistance_bands', label: 'Resistance Bands' },
  ];

  const limitationOptions = [
    { id: 'lower_back', label: 'Lower Back Sensitivity' },
    { id: 'knees', label: 'Knee Discomfort' },
    { id: 'shoulders', label: 'Shoulder Impingement' },
    { id: 'wrists', label: 'Wrist Strain' },
  ];

  const toggleEquipment = (id: string) => {
    const list = formData.equipment || [];
    if (id === 'bodyweight') {
      // Bodyweight only mode resets others
      setFormData({ ...formData, equipment: ['bodyweight'] });
      return;
    }
    const filtered = list.filter((item) => item !== 'bodyweight');
    if (filtered.includes(id)) {
      const remaining = filtered.filter((item) => item !== id);
      setFormData({
        ...formData,
        equipment: remaining.length === 0 ? ['bodyweight'] : remaining,
      });
    } else {
      setFormData({ ...formData, equipment: [...filtered, id] });
    }
  };

  const toggleLimitation = (id: string) => {
    const list = formData.limitations || [];
    if (list.includes(id)) {
      setFormData({ ...formData, limitations: list.filter((item) => item !== id) });
    } else {
      setFormData({ ...formData, limitations: [...list, id] });
    }
  };

  const handleSubmitEvaluation = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Call deterministic biometric classifier
      const evalResult: BiometricEvaluationResponse = await evaluateBiometrics(formData);

      // Store result in session storage for cinematic reveal page
      sessionStorage.setItem('sadhana_eval_result', JSON.stringify(evalResult));

      // 2. Persist profile
      try {
        const targetUsername = profile?.username || formData.name || 'Warrior';
        const updatedProfile = await saveUserProfile({
          username: targetUsername,
          name: formData.name || profile?.name || 'Seeker',
          age: formData.age,
          weight_kg: formData.weight_kg,
          primary_goal: formData.primary_goal,
          activity_level: formData.activity_level,
          assigned_class_slug: evalResult.assigned_class,
          equipment_access: formData.equipment,
          limitations: formData.limitations,
        });
        setProfile(updatedProfile);
      } catch (profileErr) {
        console.warn('Profile save warning (proceeding with evaluation):', profileErr);
      }

      // 3. Navigate to class reveal
      navigate('/reveal');
    } catch (err: any) {
      console.error('Classification error:', err);
      setErrorMsg(err.response?.data?.detail || err.message || 'Failed to evaluate biometrics. Please check backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8 animate-fadeIn">
      {/* Account Status Prompt for Unauthenticated Visitors */}
      {!isAuthenticated && (
        <div className="p-4 rounded-2xl border border-[#E7D7B7] bg-[#F7EEDC] flex items-center justify-between gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-2 text-[#59473A]">
            <Sparkles className="w-4 h-4 text-[#A52A2A] shrink-0" />
            <span>
              Initiating your journey? <strong className="text-[#352419]">Create an account</strong> to save your class and daily progression permanently.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/register')}
              className="btn btn-sm"
              type="button"
            >
              Register
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-quiet btn-sm"
              type="button"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      {/* Step Indicators */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-[#76675A]">
          <span>STEP {step} OF 4</span>
          <span className="text-[#A52A2A] uppercase tracking-wider">
            {step === 1 && 'Physical Baselines'}
            {step === 2 && 'Training Intention'}
            {step === 3 && 'Logistics & Gear'}
            {step === 4 && 'Constraints & Health'}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-[#A52A2A]' : 'bg-[#E7D7B7]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-[#FBEFEA] border border-[#A52A2A]/30 text-[#A52A2A] text-sm font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Step 1: Baselines */}
      {step === 1 && (
        <div className="parchment-card p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="space-y-1">
            <span className="section-kicker">Foundation</span>
            <h2 className="text-2xl font-black text-[#352419]">Tell us about yourself</h2>
            <p className="text-sm text-[#76675A]">
              These physical parameters establish your baseline energy output and loading threshold.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#59473A] mb-1.5">
                Your Name / Seeker Identity
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="parchment-input w-full px-4 py-3 text-sm"
                placeholder="e.g. Arjun"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#59473A] mb-1.5">Age</label>
                <input
                  type="number"
                  min="12"
                  max="90"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 20 })}
                  className="parchment-input w-full px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#59473A] mb-1.5">
                  Body Weight (kg)
                </label>
                <input
                  type="number"
                  min="30"
                  max="200"
                  step="0.5"
                  value={formData.weight_kg}
                  onChange={(e) =>
                    setFormData({ ...formData, weight_kg: parseFloat(e.target.value) || 70 })
                  }
                  className="parchment-input w-full px-4 py-3 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#59473A] mb-2">
                Training Experience Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {experienceLevels.map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, activity_level: lvl.id })}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      formData.activity_level === lvl.id
                        ? 'border-[#A52A2A] bg-[#F7E6D9] shadow-sm'
                        : 'border-[#E1D4BE] bg-white hover:bg-[#FFFBF2]'
                    }`}
                  >
                    <div className="font-bold text-xs text-[#352419]">{lvl.label}</div>
                    <div className="text-[11px] text-[#76675A] mt-1 leading-snug">{lvl.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="btn"
              type="button"
            >
              Continue to Intention <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Primary Goal */}
      {step === 2 && (
        <div className="parchment-card p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="space-y-1">
            <span className="section-kicker">Discipline Focus</span>
            <h2 className="text-2xl font-black text-[#352419]">What is your primary intention?</h2>
            <p className="text-sm text-[#76675A]">
              Sādhanā maps your training intention to one of the five core fitness disciplines.
            </p>
          </div>

          <div className="space-y-3">
            {goals.map((g) => (
              <div
                key={g.id}
                onClick={() => setFormData({ ...formData, primary_goal: g.id })}
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${
                  formData.primary_goal === g.id
                    ? 'border-[#A52A2A] bg-[#F7E6D9] shadow-sm'
                    : 'border-[#E1D4BE] bg-white hover:bg-[#FFFBF2]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#F5E6C8]/60 border border-[#E7D7B7] shrink-0">
                    {g.icon}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-[#352419] flex items-center gap-2">
                      <span>{g.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBDDC5] text-[#6D291C] font-bold">
                        {g.archetypeHint}
                      </span>
                    </div>
                    <p className="text-xs text-[#76675A] mt-0.5">{g.desc}</p>
                  </div>
                </div>
                {formData.primary_goal === g.id && (
                  <div className="w-6 h-6 rounded-full bg-[#38764A] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="btn btn-quiet"
              type="button"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="btn"
              type="button"
            >
              Logistics & Gear <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Equipment & Logistics */}
      {step === 3 && (
        <div className="parchment-card p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="space-y-1">
            <span className="section-kicker">Environment</span>
            <h2 className="text-2xl font-black text-[#352419]">Available Equipment & Schedule</h2>
            <p className="text-sm text-[#76675A]">
              We only prescribe movements for gear you actually have access to.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#59473A] mb-2">
                Available Equipment (Select all that apply)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {equipmentOptions.map((eq) => {
                  const isSelected = formData.equipment?.includes(eq.id);
                  return (
                    <button
                      key={eq.id}
                      type="button"
                      onClick={() => toggleEquipment(eq.id)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-[#A52A2A] bg-[#F7E6D9] text-[#352419]'
                          : 'border-[#E1D4BE] bg-white text-[#76675A] hover:bg-[#FFFBF2]'
                      }`}
                    >
                      <span>{eq.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#38764A] shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-[#76675A] mt-2 italic">
                * If you select &quot;Bodyweight Only&quot;, all workouts will strictly use zero equipment.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#59473A] mb-1.5">
                  Target Days / Week
                </label>
                <select
                  value={formData.available_days}
                  onChange={(e) =>
                    setFormData({ ...formData, available_days: parseInt(e.target.value) || 3 })
                  }
                  className="parchment-input w-full px-3 py-2.5 text-xs font-semibold"
                >
                  <option value={3}>3 Days (Optimal Recovery)</option>
                  <option value={4}>4 Days (Balanced Progression)</option>
                  <option value={5}>5 Days (High Consistency)</option>
                  <option value={6}>6 Days (Intensive Discipline)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#59473A] mb-1.5">
                  Typical Session Duration
                </label>
                <select
                  value={formData.session_time}
                  onChange={(e) =>
                    setFormData({ ...formData, session_time: parseInt(e.target.value) || 45 })
                  }
                  className="parchment-input w-full px-3 py-2.5 text-xs font-semibold"
                >
                  <option value={20}>20 Minutes (Express Micro-dose)</option>
                  <option value={30}>30 Minutes (Standard Efficient)</option>
                  <option value={45}>45 Minutes (Deep Practice)</option>
                  <option value={60}>60 Minutes (Complete Mastery)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="btn btn-quiet"
              type="button"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="btn"
              type="button"
            >
              Health & Safety <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Limitations & Confirmation */}
      {step === 4 && (
        <div className="parchment-card p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="space-y-1">
            <span className="section-kicker">Biomechanical Safety</span>
            <h2 className="text-2xl font-black text-[#352419]">Any Joint or Spinal Sensitivities?</h2>
            <p className="text-sm text-[#76675A]">
              We automatically de-load exercises that stress flagged areas.
            </p>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {limitationOptions.map((lim) => {
                const isSelected = formData.limitations?.includes(lim.id);
                return (
                  <button
                    key={lim.id}
                    type="button"
                    onClick={() => toggleLimitation(lim.id)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#A52A2A] bg-[#F7E6D9] text-[#352419]'
                        : 'border-[#E1D4BE] bg-white text-[#76675A] hover:bg-[#FFFBF2]'
                    }`}
                  >
                    <span>{lim.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#38764A] shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-xl border border-[#E7D7B7] bg-[#F7EEDC] space-y-2 mt-4">
              <div className="font-extrabold text-xs text-[#352419] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#A52A2A]" />
                <span>Deterministic Sādhanā Rule Engine Ready</span>
              </div>
              <p className="text-[11px] text-[#76675A] leading-relaxed">
                Upon submitting, the system classifies your archetype into one of the 5 disciplines,
                initiates your level at Level 1, and generates your customized daily practice program.
              </p>
            </div>
          </div>

          <div className="pt-4 flex justify-between">
            <button
              onClick={() => setStep(3)}
              className="btn btn-quiet"
              type="button"
              disabled={isSubmitting}
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
            <button
              onClick={handleSubmitEvaluation}
              disabled={isSubmitting}
              className="btn"
              type="button"
            >
              {isSubmitting ? (
                <span>Evaluating Biometrics...</span>
              ) : (
                <>
                  <span>Reveal My Class Discipline</span>
                  <Sparkles className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
