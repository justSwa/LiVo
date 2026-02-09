import React, { useState } from 'react';
import { UserProfile, ThemeOption } from '../types';
import LiVoLogo from './logo';

interface OnboardingProps {
  user: UserProfile;
  onComplete: (preferences: string[], themeColor: ThemeOption) => void;
}

const THEME_OPTIONS: Array<{ color: ThemeOption; label: string; accent: string; sample: string }> = [
  { color: 'beige', label: 'Warm Beige', accent: '#8b7355', sample: '#d2b48c' },
  { color: 'rose', label: 'Soft Rose', accent: '#a67c7c', sample: '#d4a5a5' },
  { color: 'lavender', label: 'Calm Lavender', accent: '#7e7482', sample: '#b5a8b9' },
  { color: 'blue', label: 'Sky Blue', accent: '#708090', sample: '#b0c4de' },
  { color: 'sage', label: 'Natural Sage', accent: '#747d63', sample: '#b2ac88' },
  { color: 'teal', label: 'Ocean Teal', accent: '#4a6d6d', sample: '#78a2a2' },
  { color: 'grey', label: 'Modern Grey', accent: '#333333', sample: '#707070' },
];

const PRIORITY_OPTIONS = [
  { id: 'mental-health', label: 'Mental Health', icon: '🧘', description: 'Mindfulness & wellness' },
  { id: 'career', label: 'Career', icon: '💼', description: 'Professional growth' },
  { id: 'family', label: 'Family', icon: '👨\u200d👩\u200d👧\u200d👦', description: 'Quality time with loved ones' },
  { id: 'hobbies', label: 'Hobbies', icon: '🎨', description: 'Personal interests & creativity' },
  { id: 'fitness', label: 'Fitness', icon: '💪', description: 'Physical health & exercise' },
  { id: 'learning', label: 'Learning', icon: '📚', description: 'Knowledge & skills' },
  { id: 'social', label: 'Social Life', icon: '👥', description: 'Friends & connections' },
  { id: 'finance', label: 'Finance', icon: '💰', description: 'Financial planning' },
  { id: 'travel', label: 'Travel', icon: '✈️', description: 'Exploration & adventure' },
  { id: 'spirituality', label: 'Spirituality', icon: '🙏', description: 'Inner peace & meaning' },
];

const Onboarding: React.FC<OnboardingProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(2); // 0: Welcome, 1: Priorities, 2: Theme
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>('beige');

  const handlePriorityToggle = (id: string) => {
    setSelectedPriorities(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleComplete = () => {
    onComplete(selectedPriorities, selectedTheme);
  };

  // Welcome Screen
  if (step === 0) {
    return (
      <div className="min-h-screen bg-[#f7f3ed] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center">
          {/* Logo with Warm Beige Color */}
          <LiVoLogo size={128} color="#8b7355" className="mx-auto mb-8 transform -rotate-6 transition-transform hover:rotate-0" />

          <h1 className="text-5xl md:text-6xl font-light text-stone-950 mb-4 tracking-tight">
            Welcome to LiVo
          </h1>
          
          <p className="text-2xl md:text-3xl text-stone-800 font-semibold mb-8">
            A calmer way to live
          </p>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 mb-8 shadow-xl border border-stone-100/50">
            <p className="text-lg text-stone-800 font-medium leading-relaxed mb-6">
              LiVo is your personal sanctuary for organizing life's moments. 
              We help you focus on what truly matters by bringing together your thoughts, 
              goals, and calendar in one tranquil space.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-stone-700">
              <div className="p-4 bg-stone-50 rounded-2xl">
                <div className="text-2xl mb-2">🌱</div>
                <div className="font-bold text-stone-900 mb-1">Mindful Planning</div>
                <div className="text-stone-700">Organize without overwhelm</div>
              </div>
              <div className="p-4 bg-stone-50 rounded-2xl">
                <div className="text-2xl mb-2">📅</div>
                <div className="font-bold text-stone-900 mb-1">Smart Sync</div>
                <div className="text-stone-700">Connect your calendar effortlessly</div>
              </div>
              <div className="p-4 bg-stone-50 rounded-2xl">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-bold text-stone-900 mb-1">Stay Focused</div>
                <div className="text-stone-700">Achieve what matters most</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep(1)}
            className="px-12 py-5 bg-[#8b7355] text-white font-bold text-lg rounded-2xl shadow-lg hover:brightness-110 transform hover:-translate-y-1 transition-all"
          >
            Let's Begin Your Journey
          </button>
        </div>
      </div>
    );
  }

  // Priorities Selection
  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#f7f3ed] flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-semibold text-stone-950 mb-3">What matters most to you?</h2>
            <p className="text-lg text-stone-800 font-medium">
              Select your priorities so we can personalize your experience
            </p>
            <p className="text-sm text-stone-700 mt-2">
              Choose at least 3, but feel free to select all that resonate
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {PRIORITY_OPTIONS.map((priority) => (
              <button
                key={priority.id}
                onClick={() => handlePriorityToggle(priority.id)}
                className={`p-6 rounded-2xl border-2 transition-all text-left ${
                  selectedPriorities.includes(priority.id)
                    ? 'border-[#8b7355] bg-[#8b7355]/10 shadow-lg scale-105'
                    : 'border-stone-200 bg-white/80 hover:border-stone-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{priority.icon}</div>
                  <div className="flex-1">
                    <div className="font-bold text-stone-950 text-lg mb-1">
                      {priority.label}
                    </div>
                    <div className="text-sm text-stone-700">
                      {priority.description}
                    </div>
                  </div>
                  {selectedPriorities.includes(priority.id) && (
                    <div className="text-[#8b7355] text-2xl">✓</div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setStep(0)}
              className="px-8 py-4 bg-stone-200 text-stone-900 font-bold rounded-2xl hover:bg-stone-300 transition-all"
            >
              Back
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={selectedPriorities.length < 3}
              className="px-12 py-4 bg-[#8b7355] text-white font-bold rounded-2xl shadow-lg hover:brightness-110 transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue ({selectedPriorities.length} selected)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Theme Selection
  return (
    <div className="min-h-screen bg-[#f7f3ed] flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-semibold text-stone-950 mb-3">Choose your vibe</h2>
          <p className="text-lg text-stone-800 font-medium">
            Select a color theme that brings you peace
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
          {THEME_OPTIONS.map((theme) => (
            <button
              key={theme.color}
              onClick={() => setSelectedTheme(theme.color)}
              className={`p-6 rounded-2xl border-2 transition-all ${
                selectedTheme === theme.color
                  ? 'border-current shadow-lg scale-105'
                  : 'border-stone-200 hover:border-stone-300 hover:shadow-md'
              }`}
              style={{ 
                borderColor: selectedTheme === theme.color ? theme.accent : undefined 
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-3 shadow-md"
                style={{ backgroundColor: theme.sample }}
              />
              <div className="font-bold text-stone-950 text-sm">{theme.label}</div>
              {selectedTheme === theme.color && (
                <div className="mt-2 text-2xl">✓</div>
              )}
            </button>
          ))}
        </div>

        {/* Preview with Logo */}
        <div 
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 mb-8 shadow-xl border-2"
          style={{ borderColor: THEME_OPTIONS.find(t => t.color === selectedTheme)?.accent }}
        >
          <div className="flex items-center gap-4 mb-6">
            <LiVoLogo 
              size={64} 
              color={THEME_OPTIONS.find(t => t.color === selectedTheme)?.accent || '#8b7355'}
            />
            <div>
              <h3 className="text-xl font-bold text-stone-950">Your LiVo Preview</h3>
              <p className="text-sm text-stone-700">See how your theme will look</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-stone-50 rounded-xl flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: THEME_OPTIONS.find(t => t.color === selectedTheme)?.accent }}
              />
              <span className="text-stone-800 font-medium">Your personalized priorities</span>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: THEME_OPTIONS.find(t => t.color === selectedTheme)?.accent }}
              />
              <span className="text-stone-800 font-medium">Calendar events and tasks</span>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: THEME_OPTIONS.find(t => t.color === selectedTheme)?.accent }}
              />
              <span className="text-stone-800 font-medium">Mindful reminders</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setStep(1)}
            className="px-8 py-4 bg-stone-200 text-stone-900 font-bold rounded-2xl hover:bg-stone-300 transition-all"
          >
            Back
          </button>
          <button
            onClick={handleComplete}
            className="px-12 py-4 bg-[#8b7355] text-white font-bold rounded-2xl shadow-lg hover:brightness-110 transform hover:-translate-y-1 transition-all"
          >
            Enter Your Sanctuary
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;