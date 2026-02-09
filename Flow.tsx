import React from 'react';
import { ChatMessage, Memory, UserProfile } from '../types';

interface FlowProps {
  user: UserProfile;
  memories: Memory[];
  history: ChatMessage[];
}

const Flow: React.FC<FlowProps> = ({ user, memories, history }) => {
  const isDeveloping = history.length < 3 && memories.length < 3;

  const memoryCounts = memories.reduce((acc: Record<string, number>, memory) => {
    acc[memory.type] = (acc[memory.type] || 0) + 1;
    return acc;
  }, {});

  const entries = Object.entries(memoryCounts) as Array<[string, number]>;
  const topMemoryType = entries.sort((a, b) => b[1] - a[1])[0]?.[0];

  const lastActivity = history
    .map((item) => item.timestamp)
    .sort()
    .pop();

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-light text-stone-900 tracking-tight">
            Flow
          </h1>
          <p className="text-stone-700 font-bold mt-2 text-lg">
            Pattern discovery and behavior analysis for {user.name}.
          </p>
        </div>
        <div className="px-4 py-2 rounded-full bg-accent-light text-accent text-xs font-black uppercase tracking-widest">
          {isDeveloping ? 'Developing' : 'Active'}
        </div>
      </header>

      {isDeveloping ? (
        <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm">
          <h2 className="text-2xl font-bold text-stone-900 mb-4">Flow is still learning</h2>
          <p className="text-stone-700 leading-relaxed">
            As a new user, your Flow is still developing. Keep sharing thoughts and goals so we can
            surface patterns, rhythms, and insights tailored to you.
          </p>
        </div>
      ) : (
        <section className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">Current patterns</h2>
            <p className="text-stone-700 leading-relaxed">
              We are spotting themes across your activity. Keep logging moments to refine these insights.
            </p>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-stone-50">
                <p className="text-xs font-black uppercase tracking-widest text-stone-500">Top focus</p>
                <p className="text-lg font-bold text-stone-900 mt-2">
                  {topMemoryType ? topMemoryType : 'Still discovering'}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-stone-50">
                <p className="text-xs font-black uppercase tracking-widest text-stone-500">Recent activity</p>
                <p className="text-lg font-bold text-stone-900 mt-2">
                  {lastActivity ? new Date(lastActivity).toLocaleDateString() : 'No recent activity'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm">
            <h3 className="text-xl font-bold text-stone-900 mb-4">Insight signals</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-stone-50 text-stone-700 text-sm font-bold">
                Activity samples: {history.length}
              </div>
              <div className="p-4 rounded-2xl bg-stone-50 text-stone-700 text-sm font-bold">
                Memories captured: {memories.length}
              </div>
              <div className="p-4 rounded-2xl bg-stone-50 text-stone-700 text-sm font-bold">
                Pattern confidence: {memories.length > 10 ? 'High' : 'Growing'}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Flow;
