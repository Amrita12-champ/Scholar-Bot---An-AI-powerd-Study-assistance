import React from 'react';
import { 
  LayoutDashboard, 
  Timer, 
  BookOpen, 
  FileText, 
  Calendar, 
  Users, 
  Trophy, 
  MessageSquareCode, 
  FileQuestion, 
  Sparkles, 
  LogOut,
  Flame,
  GraduationCap
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'timer', name: 'Focus Timer', icon: Timer },
    { id: 'syllabus', name: 'Syllabus', icon: BookOpen },
    { id: 'notes', name: 'Notes & AI', icon: FileText },
    { id: 'exams', name: 'Exam Prep', icon: Calendar },
    { id: 'rooms', name: 'Study Rooms', icon: Users },
    { id: 'leaderboard', name: 'Leaderboard', icon: Trophy },
    { id: 'tutor', name: 'AI Tutor', icon: MessageSquareCode },
    { id: 'quiz', name: 'AI Quiz', icon: FileQuestion },
    { id: 'softskills', name: 'Soft Skills AI', icon: Sparkles },
  ];

  const nextLevelXp = user ? user.level * 1000 : 1000;
  const prevLevelXp = user ? (user.level - 1) * 1000 : 0;
  const xpInCurrentLevel = user ? (user.xp - prevLevelXp) : 0;
  const xpNeededForNext = 1000; // Each level takes 1000 XP in server calculations
  const xpPercentage = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNext) * 100));

  return (
    <aside id="sidebar-container" className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div id="sidebar-brand" className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-xl text-white">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-sans font-bold text-lg text-white tracking-tight">ScholarBot</h1>
          <span className="text-xs text-slate-400 font-mono">v1.1.0 (JS Mode)</span>
        </div>
      </div>

      {/* User Progress Card */}
      {user && (
        <div id="sidebar-user-card" className="p-4 mx-4 my-4 bg-slate-800/50 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-10 h-10 rounded-full border border-slate-700 bg-slate-900"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-medium text-slate-200 truncate">{user.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="bg-indigo-950 text-indigo-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  Lvl {user.level}
                </span>
                <span className="flex items-center text-amber-500 font-mono text-xs font-bold">
                  <Flame className="w-3.5 h-3.5 fill-current" /> {user.streak}d
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
              <span>XP: {user.xp}</span>
              <span>Lvl {user.level + 1}</span>
            </div>
            <div className="w-full bg-slate-750 h-2 rounded-full overflow-hidden border border-slate-700">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${xpPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 font-mono flex justify-between">
            <span>Points: 🪙{user.studyPoints}</span>
            <span>{1000 - (user.xp % 1000)} XP to next lvl</span>
          </div>
        </div>
      )}

      {/* Menu Options */}
      <nav id="sidebar-nav" className="flex-1 overflow-y-auto px-3 space-y-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <IconComponent className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div id="sidebar-footer" className="p-4 border-t border-slate-800">
        <button
          id="btn-logout"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl text-sm font-medium transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
