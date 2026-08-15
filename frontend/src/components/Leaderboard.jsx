import React from 'react';
import { Trophy, Medal, Flame, Star, Award } from 'lucide-react';

export default function Leaderboard({ leaderboard = [], user }) {
  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const getPodiumBadgeColor = (rank) => {
    switch(rank) {
      case 1: return 'bg-amber-100 border-amber-300 text-amber-800 shadow-amber-500/10';
      case 2: return 'bg-slate-100 border-slate-300 text-slate-800 shadow-slate-400/10';
      case 3: return 'bg-orange-100 border-orange-300 text-orange-800 shadow-orange-500/10';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  const getPodiumCrownColor = (rank) => {
    switch(rank) {
      case 1: return 'text-amber-500 fill-amber-300';
      case 2: return 'text-slate-400 fill-slate-200';
      case 3: return 'text-orange-500 fill-orange-300';
      default: return 'text-slate-300';
    }
  };

  return (
    <div id="leaderboard-view" className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          Global Scholar Standings <Trophy className="w-6 h-6 text-amber-500 fill-current animate-pulse" />
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Stay focused to accumulate study XP, expand your level metrics, and secure a spot on the global leaderboards.
        </p>
      </div>

      {/* Podium (Top 3) */}
      {topThree.length > 0 && (
        <div id="leaderboard-podium" className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
          {/* Rank 2 (left) */}
          {topThree[1] && (
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center relative order-2 md:order-1 border-t-4 border-t-slate-400 mt-4 md:mt-8">
              <span className="absolute -top-3 bg-slate-100 text-slate-700 font-bold px-3 py-0.5 rounded-full border border-slate-300 text-xs font-mono">
                Rank 2
              </span>
              <div className="relative mb-3">
                <img 
                  src={topThree[1].avatar} 
                  alt={topThree[1].userName} 
                  className="w-16 h-16 rounded-full border-2 border-slate-300 bg-slate-50"
                  referrerPolicy="no-referrer"
                />
                <Medal className="w-6 h-6 text-slate-400 absolute -bottom-1 -right-1" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm truncate max-w-[150px]">{topThree[1].userName}</h3>
              <div className="mt-2 text-xs font-mono font-bold text-slate-500 flex items-center gap-1">
                <span>{topThree[1].xp} XP</span>
                <span className="text-slate-300">•</span>
                <span className="text-amber-500 flex items-center gap-0.5 font-sans"><Flame className="w-3.5 h-3.5 fill-current" /> {topThree[1].streak}d</span>
              </div>
            </div>
          )}

          {/* Rank 1 (center) */}
          {topThree[0] && (
            <div className="bg-gradient-to-b from-amber-50/40 to-white p-6 rounded-3xl border border-amber-100 shadow-md flex flex-col items-center justify-center text-center relative order-1 md:order-2 border-t-4 border-t-amber-500 scale-105 z-10">
              <span className="absolute -top-3 bg-amber-500 text-white font-extrabold px-4 py-0.5 rounded-full text-xs font-mono shadow-sm flex items-center gap-1 uppercase tracking-widest">
                <Star className="w-3.5 h-3.5 fill-current text-white" /> Rank 1
              </span>
              <div className="relative mb-4">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <Trophy className={`w-8 h-8 ${getPodiumCrownColor(1)}`} />
                </div>
                <img 
                  src={topThree[0].avatar} 
                  alt={topThree[0].userName} 
                  className="w-20 h-20 rounded-full border-2 border-amber-400 bg-amber-50/50"
                  referrerPolicy="no-referrer"
                />
                <Award className="w-7 h-7 text-amber-500 fill-current absolute -bottom-1 -right-1 animate-bounce" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base truncate max-w-[170px]">{topThree[0].userName}</h3>
              <div className="mt-2 text-sm font-mono font-bold text-indigo-600 flex items-center gap-1.5 justify-center">
                <span>{topThree[0].xp} XP</span>
                <span className="text-slate-300">•</span>
                <span className="text-amber-500 flex items-center gap-0.5 font-sans"><Flame className="w-4 h-4 fill-current animate-pulse" /> {topThree[0].streak}d</span>
              </div>
            </div>
          )}

          {/* Rank 3 (right) */}
          {topThree[2] && (
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center relative order-3 md:order-3 border-t-4 border-t-orange-400 mt-4 md:mt-8">
              <span className="absolute -top-3 bg-orange-100 text-orange-700 font-bold px-3 py-0.5 rounded-full border border-orange-300 text-xs font-mono">
                Rank 3
              </span>
              <div className="relative mb-3">
                <img 
                  src={topThree[2].avatar} 
                  alt={topThree[2].userName} 
                  className="w-16 h-16 rounded-full border-2 border-orange-300 bg-slate-50"
                  referrerPolicy="no-referrer"
                />
                <Medal className="w-6 h-6 text-orange-500 absolute -bottom-1 -right-1" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm truncate max-w-[150px]">{topThree[2].userName}</h3>
              <div className="mt-2 text-xs font-mono font-bold text-slate-500 flex items-center gap-1">
                <span>{topThree[2].xp} XP</span>
                <span className="text-slate-300">•</span>
                <span className="text-amber-500 flex items-center gap-0.5 font-sans"><Flame className="w-3.5 h-3.5 fill-current" /> {topThree[2].streak}d</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Table (Ranks 4+) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">All Standings</span>
          <span className="text-xs text-slate-500 font-medium">Rankings reset dynamically based on XP earnings</span>
        </div>

        <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto pr-1">
          {rest.length > 0 ? (
            rest.map((entry) => {
              const isCurrentUser = entry.userId === user?.id;
              return (
                <div 
                  key={entry.userId} 
                  id={`leaderboard-row-${entry.rank}`}
                  className={`px-5 py-4 flex items-center justify-between gap-4 transition ${
                    isCurrentUser ? 'bg-indigo-50/30' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="font-mono text-xs font-extrabold text-slate-400 w-6">
                      #{entry.rank}
                    </span>
                    <img 
                      src={entry.avatar} 
                      alt={entry.userName} 
                      className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="truncate">{entry.userName}</span>
                        {isCurrentUser && (
                          <span className="bg-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.2 rounded-full font-bold font-mono">
                            YOU
                          </span>
                        )}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" /> {entry.streak} Days Streak
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-800">
                    {entry.xp} XP
                  </span>
                </div>
              );
            })
          ) : (
            // Fallback row if only 3 users
            <div className="p-6 text-center text-slate-400 text-xs">
              No further ranking records found. Enter study halls or finish pomodoro cycles to claim rankings!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
