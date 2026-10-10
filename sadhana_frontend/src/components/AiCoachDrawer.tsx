import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { chatWithAiCoach } from '../services/api';
import { gameAudio } from '../utils/gameAudio';
import { X, Send, Lock } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  time: string;
}

export const AiCoachDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { profile, isAuthenticated } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  
  const currentUserName = profile?.name || profile?.username || 'Warrior';
  const activeUserKeyRef = useRef<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const greetingFetchedRef = useRef(false);

  const quickPrompts = [
    'I only have 20 minutes today',
    'Working out at home with only dumbbells',
    'My knees feel sore today, no squats',
    'Focus on upper body and core stability',
  ];

  const handleSend = useCallback(async (userText: string) => {
    if (!userText.trim() || isTyping) return;

    gameAudio.playClick();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const userEquip = profile?.equipment_access?.join(',') || 'bodyweight';
      const classSlug = profile?.assigned_class?.slug || profile?.assigned_class_slug || 'yodha';
      
      // Dynamic AI generation directly from backend AI Coach
      const res = await chatWithAiCoach({
        message: userText,
        class_slug: classSlug,
        duration: 45,
        equipment: userEquip,
        username: currentUserName,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'coach',
          text: res.reply,
          time: 'Just now',
        },
      ]);
      gameAudio.playXpGain();

      // If quest plan was adapted, persist and notify active quest views
      if (res.adapted && res.plan) {
        sessionStorage.setItem('sadhana_active_plan', JSON.stringify(res.plan));
        window.dispatchEvent(new CustomEvent('sadhana_plan_updated', { detail: res.plan }));
        gameAudio.playLevelUp();
      }
    } catch (err) {
      console.error('sAI connection error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'coach',
          text: 'The sanctuary connection was interrupted. Please try asking again in a moment.',
          time: 'Just now',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [isTyping, profile, currentUserName]);

  // Fetch live AI greeting when drawer is opened for the first time
  useEffect(() => {
    if (isOpen && isAuthenticated && messages.length === 0 && !greetingFetchedRef.current) {
      greetingFetchedRef.current = true;
      setIsTyping(true);
      const userEquip = profile?.equipment_access?.join(',') || 'bodyweight';
      const classSlug = profile?.assigned_class?.slug || profile?.assigned_class_slug || 'yodha';

      chatWithAiCoach({
        message: 'Hello! Greet me warmly as my AI fitness coach and ask how I feel today.',
        class_slug: classSlug,
        duration: 45,
        equipment: userEquip,
        username: currentUserName,
      })
        .then((res) => {
          if (res?.reply) {
            setMessages([
              {
                id: '1',
                sender: 'coach',
                text: res.reply,
                time: 'Just now',
              },
            ]);
          }
        })
        .catch((err) => {
          console.error('Failed to load live AI greeting:', err);
          setMessages([
            {
              id: '1',
              sender: 'coach',
              text: 'sAI neural stream is connecting... Send a message below to start your live consultation.',
              time: 'Just now',
            },
          ]);
        })
        .finally(() => {
          setIsTyping(false);
        });
    }
  }, [isOpen, isAuthenticated, messages.length, profile, currentUserName]);

  // Reset greeting cache if user profile switches
  useEffect(() => {
    const userKey = profile ? `${profile.id || ''}_${profile.username || ''}_${profile.name || ''}` : 'guest';
    if (activeUserKeyRef.current !== userKey) {
      activeUserKeyRef.current = userKey;
      greetingFetchedRef.current = false;
      setMessages([]);
    }
  }, [profile, currentUserName]);

  // Listen for open-sai-coach custom event from in-page action buttons
  useEffect(() => {
    const handleOpen = (e: any) => {
      if (!isAuthenticated) {
        gameAudio.playClick();
        navigate('/login');
        return;
      }
      setIsOpen(true);
      if (e.detail?.prompt) {
        handleSend(e.detail.prompt);
      }
    };
    window.addEventListener('open-sai-coach', handleOpen);
    return () => window.removeEventListener('open-sai-coach', handleOpen);
  }, [handleSend, isAuthenticated, navigate]);

  return (
    <>
      {/* Floating Action Trigger Button - Bottom Right sAI Mascot */}
      {!isOpen && (
        !isAuthenticated ? (
          <button
            onClick={() => {
              gameAudio.playClick();
              navigate('/login');
            }}
            className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-full bg-[#A52A2A] hover:bg-[#8F2121] text-[#FFFAF2] font-black text-xs flex items-center gap-2.5 shadow-xl hover:translate-y-[-2px] active:translate-y-[2px] transition-all cursor-pointer border-2 border-[#E7D7B7] group"
            title="Sign in to use Sadhana AI sAI"
          >
            <img
              src="/assets/sai_logo.png"
              alt="sAI"
              className="w-6 h-6 rounded-full object-cover border border-white/40 group-hover:rotate-12 transition-transform shrink-0"
            />
            <span className="tracking-wide text-xs sm:text-sm font-black font-serif">
              Sign in to use Sadhana AI sAI
            </span>
            <Lock className="w-3.5 h-3.5 text-[#F1D58A] shrink-0" />
          </button>
        ) : (
          <button
            onClick={() => {
              gameAudio.playClick();
              setIsOpen(true);
            }}
            className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-full bg-[#A52A2A] hover:bg-[#8F2121] text-[#FFFAF2] font-black text-xs flex items-center gap-2.5 shadow-xl hover:translate-y-[-2px] active:translate-y-[2px] transition-all cursor-pointer border-2 border-[#E7D7B7] group"
            title="Open sAI Coach"
          >
            <img
              src="/assets/sai_logo.png"
              alt="sAI"
              className="w-6 h-6 rounded-full object-cover border border-white/40 group-hover:rotate-12 transition-transform"
            />
            <span className="tracking-wider text-sm font-black font-serif">sAI</span>
            <span className="w-2 h-2 rounded-full bg-[#38764A] animate-ping" />
          </button>
        )
      )}

      {/* Slide-out Drawer Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-[#FFFDF8] border-l-2 border-[#E7D7B7] shadow-2xl flex flex-col text-[#352419] animate-fadeIn">
          {/* Header */}
          <div className="p-4 border-b-2 border-[#E7D7B7] bg-[#2B1D14] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl overflow-hidden bg-white border-2 border-[#E7D7B7] p-0.5">
                <img src="/assets/sai_logo.png" alt="sAI" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-black text-white text-base">
                    sAI
                  </h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#A52A2A] text-white">
                    LIVE
                  </span>
                </div>
                <span className="text-[10px] text-[#D6C7B7] font-medium block">
                  Adaptive Biomechanical Companion
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                gameAudio.playClick();
                setIsOpen(false);
              }}
              className="p-2 rounded-xl text-[#D6C7B7] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isAuthenticated ? (
            /* Unauthenticated Lock State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FFFBF2]">
              <div className="w-16 h-16 rounded-2xl bg-[#FAF3E3] border-2 border-[#E7D7B7] flex items-center justify-center mb-4 p-2 shadow-sm">
                <img src="/assets/sai_logo.png" alt="sAI" className="w-full h-full object-contain" />
              </div>
              <h4 className="text-base font-black font-serif text-[#352419] mb-2">
                Sign in to use Sadhana AI sAI
              </h4>
              <p className="text-xs text-[#76675A] leading-relaxed max-w-[280px] mb-6">
                Sign in or create an account to consult with your personal adaptive sAI fitness coach.
              </p>
              <button
                onClick={() => {
                  gameAudio.playClick();
                  setIsOpen(false);
                  navigate('/login');
                }}
                className="rpg-btn"
              >
                Sign In to Sādhanā →
              </button>
            </div>
          ) : (
            <>
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-[#FFFBF2]">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.sender === 'coach' && (
                      <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 mt-0.5 border border-[#E7D7B7] bg-white p-0.5">
                        <img src="/assets/sai_logo.png" alt="sAI" className="w-full h-full object-cover rounded-lg" />
                      </div>
                    )}
                    <div
                      className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-[#A52A2A] text-white font-medium rounded-tr-none shadow-sm'
                          : 'bg-white text-[#352419] border border-[#E7D7B7] rounded-tl-none shadow-sm'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-2.5 items-center text-[#76675A] text-xs italic pl-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#A52A2A] animate-ping" />
                    <span>sAI is evaluating your biomechanics and adjusting quest nodes...</span>
                  </div>
                )}
              </div>

              {/* Quick Prompts Chips */}
              <div className="px-3 py-2 bg-[#FAF3E3] border-t border-[#E7D7B7] flex gap-1.5 overflow-x-auto">
                {quickPrompts.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    disabled={isTyping}
                    className="px-3 py-1.5 rounded-full bg-white hover:bg-[#FFFBF2] border border-[#E7D7B7] text-[10px] font-bold text-[#A52A2A] whitespace-nowrap cursor-pointer transition-colors shadow-xs"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="p-3 border-t-2 border-[#E7D7B7] bg-[#FFFDF8] flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                  placeholder="Ask sAI (e.g. 'I have 20 mins and dumbbells')..."
                  disabled={isTyping}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-[#E7D7B7] text-xs text-[#352419] placeholder-[#968777] focus:outline-none focus:border-[#A52A2A]"
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={isTyping || !input.trim()}
                  className="p-2.5 rounded-xl bg-[#A52A2A] hover:bg-[#8F2121] disabled:opacity-40 text-white cursor-pointer shadow-md transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AiCoachDrawer;
