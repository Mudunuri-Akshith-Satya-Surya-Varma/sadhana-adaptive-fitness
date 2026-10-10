import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { BiometricEvaluationResponse } from '../types';
import {
  Sparkles,
  ArrowRight,
  Target,
  Wind,
  Heart,
  Zap,
  Dumbbell,
  CheckCircle,
} from 'lucide-react';

export const ClassRevealView: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useApp();
  const [evalResult, setEvalResult] = useState<BiometricEvaluationResponse | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('sadhana_eval_result');
    if (raw) {
      try {
        setEvalResult(JSON.parse(raw));
      } catch {
        // Fallback
      }
    }
  }, []);

  const archetypeInfo: Record<
    string,
    {
      name: string;
      sanskrit: string;
      focus: string;
      color: string;
      icon: React.ReactNode;
      desc: string;
      weights: { balance: number; flexibility: number; strength: number; cardio: number; coordination: number };
    }
  > = {
    yodha: {
      name: 'Yodha',
      sanskrit: 'योद्धा',
      focus: 'Strength & Muscular Power',
      color: '#A52A2A',
      icon: <Dumbbell className="w-8 h-8 text-[#A52A2A]" />,
      desc: 'Forged in resistance. The warrior disciplines muscle density, compound mechanics, and unyielding posture.',
      weights: { strength: 40, cardio: 15, flexibility: 15, balance: 15, coordination: 15 },
    },
    vistara: {
      name: 'Vistāra',
      sanskrit: 'विस्तार',
      focus: 'Flexibility & Movement Quality',
      color: '#D99A16',
      icon: <Wind className="w-8 h-8 text-[#D99A16]" />,
      desc: 'Expansion without limitation. The practitioner frees joint capsules, lengthens myofascial tissue, and moves with grace.',
      weights: { flexibility: 40, balance: 20, strength: 15, coordination: 15, cardio: 10 },
    },
    sthira: {
      name: 'Sthira',
      sanskrit: 'स्थिर',
      focus: 'Balance & Core Stability',
      color: '#38764A',
      icon: <Target className="w-8 h-8 text-[#38764A]" />,
      desc: 'Unshakable equilibrium. Sthira roots through the midline, commands single-limb stabilization, and masters body control.',
      weights: { balance: 40, strength: 20, flexibility: 15, coordination: 15, cardio: 10 },
    },
    dhruva: {
      name: 'Dhruva',
      sanskrit: 'ध्रुव',
      focus: 'Cardio & Steadfast Stamina',
      color: '#176B87',
      icon: <Heart className="w-8 h-8 text-[#176B87]" />,
      desc: 'Unyielding persistence. The endurance athlete commands aerobic stamina, metabolic economy, and steady mental grit.',
      weights: { cardio: 40, strength: 15, coordination: 15, flexibility: 15, balance: 15 },
    },
    samanvaya: {
      name: 'Samanvaya',
      sanskrit: 'समन्वय',
      focus: 'Coordination & Athletic Agility',
      color: '#54B7B0',
      icon: <Zap className="w-8 h-8 text-[#54B7B0]" />,
      desc: 'Total system harmony. Samanvaya binds agility, proprioception, multi-planar power, and kinetic chain speed.',
      weights: { coordination: 40, strength: 20, balance: 15, cardio: 15, flexibility: 10 },
    },
  };

  const assignedSlug = evalResult?.assigned_class || profile?.assigned_class_slug || 'yodha';
  const currentArchetype = archetypeInfo[assignedSlug] || archetypeInfo['yodha'];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-10 animate-fadeIn">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F3E8CF] text-[#6D291C] text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#A52A2A]" />
          <span>Biometric Classification Complete</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#352419]">
          Your Discipline Path Revealed
        </h1>
        <p className="text-sm text-[#76675A] max-w-md mx-auto">
          Based on your baselines, experience, and intention, Sādhanā assigns your foundational archetype.
        </p>
      </div>

      {/* Main Class Card & 3D Interactive Flip Display */}
      <div className="parchment-card p-6 sm:p-10 border border-[#E8DCBE] shadow-xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-center">
        {/* Left: 3D Flip Card Artwork */}
        <div className="w-64 shrink-0">
          <div
            className={`class-card visual-class ${assignedSlug} ${isFlipped ? 'is-flipped' : ''}`}
            style={{ width: '100%' }}
          >
            <div className="flip-card" onClick={() => setIsFlipped(!isFlipped)}>
              <div className="flip-inner">
                <div className="flip-face flip-front">
                  <img
                    alt={`${currentArchetype.name} class card front`}
                    src={`/assets/card_${assignedSlug}_front.jpg`}
                  />
                  <button
                    aria-label="Turn card over"
                    className="card-flip-button"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFlipped(!isFlipped);
                    }}
                  >
                    ↻
                  </button>
                </div>
                <div className="flip-face flip-back">
                  <img
                    alt={`${currentArchetype.name} class card back`}
                    src={`/assets/card_${assignedSlug}_back.jpg`}
                  />
                  <button
                    aria-label="Return to front"
                    className="card-flip-button card-flip-back-button"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFlipped(!isFlipped);
                    }}
                  >
                    ↻
                  </button>
                </div>
              </div>
            </div>
            <div className="class-flip-caption">
              <strong>{currentArchetype.name}</strong>
              <span>{isFlipped ? 'Click to see front' : 'Click circular arrow to flip details'}</span>
            </div>
          </div>
        </div>

        {/* Right: Archetype Details */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <span
              className="text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider"
              style={{
                backgroundColor: `${currentArchetype.color}18`,
                color: currentArchetype.color,
                border: `1px solid ${currentArchetype.color}40`,
              }}
            >
              {currentArchetype.sanskrit} • {currentArchetype.name}
            </span>
            <span className="text-xs font-bold text-[#76675A]">Discipline Level 1</span>
          </div>

          <h2 className="text-2xl font-black text-[#352419]">
            {currentArchetype.focus}
          </h2>

          <p className="text-sm text-[#76675A] leading-relaxed">
            {currentArchetype.desc}
          </p>

          {/* Radar / Weights Breakdown */}
          <div className="pt-2 space-y-2">
            <div className="text-xs font-black text-[#352419] uppercase tracking-wider">
              Discipline Training Distribution:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-[#F7EEDC] flex justify-between font-bold">
                <span className="text-[#76675A]">Strength</span>
                <span className="text-[#352419]">{currentArchetype.weights.strength}%</span>
              </div>
              <div className="p-2 rounded-lg bg-[#F7EEDC] flex justify-between font-bold">
                <span className="text-[#76675A]">Cardio</span>
                <span className="text-[#352419]">{currentArchetype.weights.cardio}%</span>
              </div>
              <div className="p-2 rounded-lg bg-[#F7EEDC] flex justify-between font-bold">
                <span className="text-[#76675A]">Flexibility</span>
                <span className="text-[#352419]">{currentArchetype.weights.flexibility}%</span>
              </div>
              <div className="p-2 rounded-lg bg-[#F7EEDC] flex justify-between font-bold">
                <span className="text-[#76675A]">Balance</span>
                <span className="text-[#352419]">{currentArchetype.weights.balance}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation & Next Step CTA */}
      <div className="text-center space-y-4">
        <button
          onClick={() => navigate('/today')}
          className="btn mx-auto"
          type="button"
        >
          Begin Today&apos;s Workout <ArrowRight className="w-4 h-4 ml-1" />
        </button>
        <p className="text-xs text-[#76675A]">
          Your daily practice is ready with adaptive scaling for your available equipment and time.
        </p>
      </div>
    </div>
  );
};
