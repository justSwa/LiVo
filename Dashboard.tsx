import React, { useState } from 'react';
import { Memory, ChatMessage, UserProfile } from '../types';

interface DashboardProps {
  memories: Memory[];
  history: ChatMessage[];
  onChatClick: () => void;
  user: UserProfile; // Added user prop
}

const Dashboard: React.FC<DashboardProps> = ({ memories, history, onChatClick, user }) => {
  const [insightStatus, setInsightStatus] = useState<'visible' | 'dismissed'>('visible');
  // REMOVED: Test tasks - users start with empty slate
  const [tasks, setTasks] = useState<Array<{ id: string; text: string; completed: boolean }>>([]);
  const [newTaskText, setNewTaskText] = useState('');

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), text: newTaskText, completed: false }]);
    setNewTaskText('');
  };

  const goals = memories.filter(m => m.type === 'goal');
  const categories = [
    { type: 'goal', icon: 'fa-bullseye', color: 'bg-accent', label: 'Goals' },
    { type: 'relationship', icon: 'fa-handshake', color: 'bg-accent-light text-accent-deep', label: 'Relationships' },
    { type: 'health', icon: 'fa-heart', color: 'bg-accent-light text-accent', label: 'Health' },
    { type: 'note', icon: 'fa-pen-nib', color: 'bg-stone-200 text-stone-600', label: 'Notes' },
  ];

  return (
    <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-8 md:space-y-12 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-light text-stone-900 tracking-tight leading-tight">
            Soft morning, <span className="font-semibold text-accent">{user.name}</span>.
          </h1>
          <p className="text-stone-800 font-bold mt-2 md:mt-3 text-lg md:text-xl">Here is the state of your tranquil mind today.</p>
        </div>
        <button 
          onClick={onChatClick}
          className="group relative bg-accent text-white pl-5 pr-7 md:pl-6 md:pr-8 py-3.5 md:py-4 rounded-3xl font-black text-base md:text-xl shadow-xl hover:brightness-110 transition-all active:scale-95 flex items-center gap-3 md:gap-4 border border-white/20"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border border-white/10 group-hover:scale-110 transition-transform">
            <i className="fas fa-plus text-lg md:text-xl text-white"></i>
          </div>
          <span className="relative z-10">Share a Thought</span>
        </button>
      </header>

      <section className="grid lg:grid-cols-3 gap-8 md:gap-10">
        <div className="lg:col-span-2 space-y-8 md:space-y-10">
          {/* Proactive Insight - Only shown if user has activity */}
          {insightStatus === 'visible' && memories.length > 5 && (
            <div className="bg-accent-light border border-accent/10 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 relative overflow-hidden group shadow-sm transition-all hover:shadow-md">
              <div className="absolute top-0 right-0 p-8 md:p-12 opacity-10 group-hover:opacity-20 transition-all transform group-hover:scale-110 pointer-events-none">
                <i className="fas fa-feather text-[6rem] md:text-[10rem] text-accent-deep"></i>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4 md:mb-6">
                  <span className="bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-accent text-[10px] md:text-xs font-black uppercase tracking-widest shadow-sm border border-accent/10">Proactive Pulse</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-stone-900 mb-4 md:mb-6 leading-tight">Your journey with LiVo is just beginning.</h3>
                <p className="text-stone-800 text-lg md:text-xl leading-relaxed mb-8 md:mb-10 max-w-xl font-medium">
                  Start by sharing your thoughts, setting goals, or syncing your calendar. We'll help you find patterns and stay focused on what matters.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                  <button 
                    onClick={onChatClick}
                    className="bg-accent text-white px-6 md:px-8 py-3.5 md:py-4 rounded-2xl font-bold text-base md:text-lg shadow-md hover:brightness-110 transition-all active:scale-95"
                  >
                    Let's Start
                  </button>
                  <button 
                    onClick={() => setInsightStatus('dismissed')}
                    className="bg-white border border-accent/10 text-accent px-6 md:px-8 py-3.5 md:py-4 rounded-2xl font-bold text-base md:text-lg hover:bg-stone-50 transition-all active:scale-95"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Goal Momentum */}
          <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 border border-stone-100 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-8 md:mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-stone-900 flex items-center gap-4 md:gap-5 tracking-tight">
                <i className="fas fa-bullseye text-accent-deep opacity-30"></i>
                Goal Momentum
              </h3>
            </div>
            <div className="space-y-8 md:space-y-12">
              {goals.length > 0 ? goals.map(goal => (
                <div key={goal.id} className="group cursor-default">
                  <div className="flex justify-between items-end mb-3 md:mb-4">
                    <span className="font-black text-stone-900 text-lg md:text-xl">{goal.content}</span>
                    <span className="text-sm md:text-base font-black text-accent tracking-widest">{goal.metadata?.progress || 0}%</span>
                  </div>
                  <div className="h-3 md:h-4 w-full bg-stone-50 rounded-full overflow-hidden shadow-inner border border-stone-100/50">
                    <div 
                      className="h-full bg-accent rounded-full transition-all duration-1000 group-hover:brightness-110" 
                      style={{ width: `${goal.metadata?.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              )) : (
                <div className="py-16 md:py-20 text-center bg-stone-50 rounded-[2rem] md:rounded-[2.5rem] border-2 border-dashed border-stone-100">
                  <div className="mb-6">
                    <i className="fas fa-bullseye text-4xl text-stone-300"></i>
                  </div>
                  <p className="text-stone-700 font-bold text-lg md:text-xl px-4 mb-4">No goals set yet</p>
                  <p className="text-stone-500 text-sm px-4">What would you like to achieve? Start a conversation with your assistant to set your first goal.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Focus Points */}
        <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 border border-stone-100 shadow-sm flex flex-col h-fit lg:sticky lg:top-12 transition-all hover:shadow-md">
          <h3 className="text-xl md:text-2xl font-bold text-stone-900 mb-6 md:mb-8 flex items-center gap-4 tracking-tight">
            <i className="fas fa-bullseye text-accent"></i>
            Focus Points
          </h3>
          <div className="space-y-4 md:space-y-6 mb-8 md:mb-10 max-h-72 md:max-h-96 overflow-y-auto pr-2 md:pr-3 custom-scrollbar">
            {tasks.length > 0 ? tasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => toggleTask(task.id)}
                className="flex items-center gap-4 md:gap-5 cursor-pointer group p-2 md:p-3 hover:bg-stone-50 rounded-2xl transition-all"
              >
                <div className={`w-8 h-8 md:w-8 md:h-8 shrink-0 rounded-xl border-2 flex items-center justify-center transition-all ${
                  task.completed ? 'bg-accent border-accent text-white shadow-md' : 'border-stone-300 bg-white group-hover:border-accent shadow-sm'
                }`}>
                  {task.completed && <i className="fas fa-check text-xs md:text-sm"></i>}
                </div>
                <span className={`text-base md:text-xl transition-all ${task.completed ? 'text-stone-400 line-through' : 'text-stone-900 font-black'}`}>
                  {task.text}
                </span>
              </div>
            )) : (
              <div className="py-8 text-center text-stone-400">
                <i className="fas fa-check-circle text-3xl mb-3 block"></i>
                <p className="text-sm">Add your first task to get started</p>
              </div>
            )}
          </div>
          
          <form onSubmit={addTask} className="relative mt-auto">
            <input 
              type="text" 
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Add focal point..."
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 md:px-6 py-3.5 md:py-4 text-base md:text-xl text-stone-900 focus:outline-none focus:ring-4 focus:ring-accent-light transition-all pr-14 md:pr-16 placeholder:text-stone-400 font-bold"
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 bg-accent-light text-accent rounded-xl hover:brightness-95 transition-all flex items-center justify-center shadow-sm"
            >
              <i className="fas fa-plus text-xs md:text-sm"></i>
            </button>
          </form>

          {tasks.length > 0 && (
            <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-stone-100 flex items-center justify-between">
              <span className="text-[10px] md:text-[11px] font-black text-stone-700 uppercase tracking-widest">Mind Momentum</span>
              <span className="text-xs md:text-sm font-black text-accent">
                {Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)}%
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {categories.map(cat => (
          <div key={cat.type} className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-xl transition-all text-center group cursor-pointer overflow-hidden relative">
             <div className="absolute inset-0 bg-stone-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className={`relative z-10 w-12 h-12 md:w-16 md:h-16 ${cat.color} rounded-[1rem] md:rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-md group-hover:scale-110 transition-transform`}>
              {typeof cat.color === 'string' && !cat.color.includes('text') && <i className={`fas ${cat.icon} text-lg md:text-2xl text-white`}></i>}
              {typeof cat.color === 'string' && cat.color.includes('text') && <i className={`fas ${cat.icon} text-lg md:text-2xl`}></i>}
            </div>
            <h4 className="relative z-10 text-[10px] md:text-[12px] font-black text-stone-900 uppercase tracking-widest mb-2 md:mb-3">{cat.label}</h4>
            <p className="relative z-10 text-3xl md:text-4xl font-black text-stone-950 tracking-tighter">{memories.filter(m => m.type === cat.type).length}</p>
          </div>
        ))}
      </section>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        @media (min-width: 768px) { .custom-scrollbar::-webkit-scrollbar { width: 6px; } }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f0ebeb; border-radius: 12px; }
      `}</style>
    </div>
  );
};

export default Dashboard;