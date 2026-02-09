import React from 'react';
import { UserProfile } from '../types';

interface MindVaultProps {
  user: UserProfile;
  onOpenChat: () => void;
}

const MindVault: React.FC<MindVaultProps> = ({ user, onOpenChat }) => {
  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-light text-stone-900 tracking-tight">
            Mind Vault
          </h1>
          <p className="text-stone-700 font-bold mt-2 text-lg">
            Your personal assistant for goal-building and guidance.
          </p>
        </div>
        <button
          onClick={onOpenChat}
          className="bg-accent text-white px-6 py-3 rounded-2xl font-black shadow-lg hover:brightness-110 transition-all"
        >
          Start a session
        </button>
      </header>

      <section className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm">
          <h2 className="text-2xl font-bold text-stone-900 mb-4">Welcome, {user.name}</h2>
          <p className="text-stone-700 leading-relaxed">
            Use Mind Vault to shape goals, break them into steps, and get advice on next actions.
            Start a session and tell LiVo what you want to achieve.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="px-4 py-2 rounded-full bg-accent-light text-accent text-xs font-black uppercase tracking-widest">
              Goal Planning
            </span>
            <span className="px-4 py-2 rounded-full bg-accent-light text-accent text-xs font-black uppercase tracking-widest">
              Decision Support
            </span>
            <span className="px-4 py-2 rounded-full bg-accent-light text-accent text-xs font-black uppercase tracking-widest">
              Accountability
            </span>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm">
          <h3 className="text-xl font-bold text-stone-900 mb-4">Suggested prompts</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-stone-50 text-stone-700 text-sm font-bold">
              "Help me define a 30-day goal for better focus"
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 text-stone-700 text-sm font-bold">
              "Break my goal into weekly steps"
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 text-stone-700 text-sm font-bold">
              "What should I do next to stay consistent?"
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MindVault;
