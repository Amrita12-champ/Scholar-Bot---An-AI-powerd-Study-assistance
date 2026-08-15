import React, { useMemo } from 'react';
import { 
  Trophy, 
  Clock, 
  Flame, 
  BookOpen, 
  TrendingUp, 
  Sparkles,
  Zap,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

export default function Dashboard({ user, sessions = [], syllabus = [], exams = [], setActiveTab }) {
  // Safe normalization helper to protect array states
  const safeSessions = useMemo(() => Array.isArray(sessions) ? sessions : [], [sessions]);
  const safeSyllabus = useMemo(() => Array.isArray(syllabus) ? syllabus : [], [syllabus]);
  const safeExams = useMemo(() => Array.isArray(exams) ? exams : [], [exams]);

  // Compute session stats
  const stats = useMemo(() => {
    const totalMinutes = safeSessions.reduce((acc, curr) => acc + (curr.completed ? curr.duration : 0), 0);
    const completedSessionsCount = safeSessions.filter(s => s.completed).length;
    
    const categoryTotals = {
      'Mathematics': 0,
      'Physics': 0,
      'Computer Science': 0,
      'Language': 0,
      'Other': 0
    };
    
    safeSessions.forEach(s => {
      if (s.completed) {
        const cat = s.category || 'Other';
        if (categoryTotals[cat] !== undefined) {
          categoryTotals[cat] += s.duration;
        } else {
          categoryTotals['Other'] += s.duration;
        }
      }
    });

    return {
      totalMinutes,
      completedSessionsCount,
      categoryTotals
    };
  }, [safeSessions]);

  // Compute syllabus progress
  const syllabusStats = useMemo(() => {
    const total = safeSyllabus.length;
    if (total === 0) return { masteredPercent: 0, completedCount: 0, totalCount: 0, inProgressCount: 0 };
    const mastered = safeSyllabus.filter(item => item.status === 'mastered').length;
    const inProgress = safeSyllabus.filter(item => item.status === 'in_progress').length;
    return {
      masteredPercent: Math.round((mastered / total) * 100),
      completedCount: mastered,
      totalCount: total,
      inProgressCount: inProgress
    };
  }, [safeSyllabus]);

  // Data for Category Target vs Actual (Safely parsing categoryTargetsJson)
  const chartData = useMemo(() => {
    if (!user) return [];
    
    let targetsObj = {
      'Mathematics': 60,
      'Physics': 60,
      'Computer Science': 60,
      'Language': 30,
      'Other': 30
    };

    if (user.categoryTargetsJson) {
      try {
        targetsObj = JSON.parse(user.categoryTargetsJson);
      } catch (e) {
        console.error("Failed to parse user category targets:", e);
      }
    }

    return Object.keys(targetsObj).map(category => {
      return {
        name: category,
        Target: targetsObj[category] || 0,
        Actual: stats.categoryTotals[category] || 0
      };
    });
  }, [user, stats.categoryTotals]);

  // Data for Pie Chart of Actual Study Distribution
  const pieData = useMemo(() => {
    const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];
    const activeCategories = Object.keys(stats.categoryTotals).filter(cat => stats.categoryTotals[cat] > 0);
    
    if (activeCategories.length === 0) {
      return [{ name: 'No sessions yet', value: 1, color: '#64748b' }];
    }

    return activeCategories.map((cat, idx) => ({
      name: cat,
      value: stats.categoryTotals[cat],
      color: COLORS[idx % COLORS.length]
    }));
  }, [stats.categoryTotals]);

  // Upcoming Exam Goal card with embedded defensive task array parsing parsing safety
  const nextExam = useMemo(() => {
    if (safeExams.length === 0) return null;
    
    const sorted = [...safeExams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const exam = sorted[0];

    // Build or pull safe tasks representation out of backend storage configurations
    let parsedTasks = [];
    if (exam && exam.tasksJson) {
      try {
        parsedTasks = JSON.parse(exam.tasksJson);
      } catch(e) {
        console.error("Failed parsing specific exam tasks checklist:", e);
      }
    }

    return {
      ...exam,
      tasks: Array.isArray(exam.tasks) ? exam.tasks : parsedTasks
    };
  }, [safeExams]);

  const motivationQuote = useMemo(() => {
    const quotes = [
      "The beautiful thing about learning is that no one can take it away from you.",
      "Success is the sum of small efforts, repeated day in and day out.",
      "Don't wish it were easier. Wish you were better.",
      "There is no elevator to success. You have to take the stairs.",
      "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice."
    ];
    const index = new Date().getDate() % quotes.length;
    return quotes[index];
  }, []);

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Header */}
      <div id="dashboard-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Welcome back, <span className="text-indigo-600">{user?.name || "Student"}</span>! <Sparkles className="w-5 h-5 text-amber-500 fill-current" />
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            " {motivationQuote} "
          </p>
        </div>
        <div className="flex gap-2 font-mono text-xs">
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-3 py-1 font-semibold flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Server Sync Online
          </span>
        </div>
      </div>

      {/* Grid of Key Stats */}
      <div id="dashboard-stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
            <Flame className="w-6 h-6 fill-current" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Daily Streak</span>
            <span className="text-2xl font-bold text-slate-900 font-mono">{user?.streak || 0} Days</span>
            <span className="text-xs text-slate-400 block mt-0.5">Keep learning daily!</span>
          </div>
        </div>

        {/* Study Hours Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Time Studied</span>
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {Math.round(stats.totalMinutes)} min
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">{stats.completedSessionsCount} completed blocks</span>
          </div>
        </div>

        {/* Syllabus Progress Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Syllabus Mastered</span>
            <span className="text-2xl font-bold text-slate-900 font-mono">{syllabusStats.masteredPercent}%</span>
            <span className="text-xs text-slate-400 block mt-0.5">
              {syllabusStats.completedCount}/{syllabusStats.totalCount} topics mastered
            </span>
          </div>
        </div>

        {/* Study Points / Level Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-purple-50 p-3 rounded-xl text-purple-600">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Scholar Points</span>
            <span className="text-2xl font-bold text-slate-900 font-mono">🪙 {user?.studyPoints || 0}</span>
            <span className="text-xs text-slate-400 block mt-0.5">Level {user?.level || 1} Scholar</span>
          </div>
        </div>
      </div>

      {/* Visual Charts & Progress Breakdown */}
      <div id="dashboard-charts" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Target vs Actual (Bar Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Weekly Target vs Actual Study Time</h3>
              <p className="text-xs text-slate-400">Comparing your custom subject targets to focus sessions in minutes</p>
            </div>
            <TrendingUp className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', color: '#f1f5f9', borderRadius: '12px', border: 'none' }}
                  labelStyle={{ fontWeight: 'bold', color: '#818cf8' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, marginTop: 10 }} />
                <Bar dataKey="Target" fill="#e2e8f0" name="Target (min)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#4f46e5" name="Completed (min)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Study Share Distribution (Pie Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="font-semibold text-slate-900 text-base mb-1">Subject Allocation</h3>
          <p className="text-xs text-slate-400 mb-4">Proportion of your study session distribution</p>
          <div className="h-48 flex-1 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', color: '#f1f5f9', borderRadius: '12px', border: 'none' }}
                  formatter={(value) => [`${value} min`, 'Study Time']}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute text-center">
              <span className="text-2xl font-bold text-slate-800 font-mono">
                {stats.totalMinutes}
              </span>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Total Min</span>
            </div>
          </div>
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-medium">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-slate-600 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }}></span>
                <span className="truncate">{entry.name}</span>
                <span className="text-slate-400 ml-auto font-mono text-[10px]">
                  {entry.value > 0 ? `${Math.round((entry.value / (stats.totalMinutes || 1)) * 100)}%` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions & Upcoming Exam Planner */}
      <div id="dashboard-actions-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Action Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-semibold text-slate-900 text-base mb-4 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-indigo-500 fill-current" /> Fast Study Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab('timer')}
              className="p-4 text-left rounded-xl border border-indigo-50 hover:border-indigo-100 bg-indigo-50/20 hover:bg-indigo-50/40 transition group"
            >
              <Clock className="w-5 h-5 text-indigo-600 mb-2" />
              <span className="text-sm font-semibold text-slate-800 block group-hover:text-indigo-700">Focus Session</span>
              <span className="text-xs text-slate-400">Launch Pomodoro</span>
            </button>
            <button
              onClick={() => setActiveTab('tutor')}
              className="p-4 text-left rounded-xl border border-purple-50 hover:border-purple-100 bg-purple-50/20 hover:bg-purple-50/40 transition group"
            >
              <Sparkles className="w-5 h-5 text-purple-600 mb-2" />
              <span className="text-sm font-semibold text-slate-800 block group-hover:text-purple-700">AI Tutor Chat</span>
              <span className="text-xs text-slate-400">Query ScholarBot</span>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className="p-4 text-left rounded-xl border border-sky-50 hover:border-sky-100 bg-sky-50/20 hover:bg-sky-50/40 transition group"
            >
              <BookOpen className="w-5 h-5 text-sky-600 mb-2" />
              <span className="text-sm font-semibold text-slate-800 block group-hover:text-sky-700">Study Notes</span>
              <span className="text-xs text-slate-400">AI summarize & cards</span>
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className="p-4 text-left rounded-xl border border-emerald-50 hover:border-emerald-100 bg-emerald-50/20 hover:bg-emerald-50/40 transition group"
            >
              <Trophy className="w-5 h-5 text-emerald-600 mb-2" />
              <span className="text-sm font-semibold text-slate-800 block group-hover:text-emerald-700">AI Quiz Test</span>
              <span className="text-xs text-slate-400">Weekly preparedness</span>
            </button>
          </div>
        </div>

        {/* Next Exam Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-base mb-3">Closest Exam Target</h3>
            {nextExam ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{nextExam.title}</h4>
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full font-semibold inline-block mt-1">
                      {nextExam.subject}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono font-bold">
                    {nextExam.date ? new Date(nextExam.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "Soon"}
                  </span>
                </div>
                {/* Preparation progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium">
                    <span>Preparation Preparedness</span>
                    <span className="font-mono text-indigo-600 font-bold">{nextExam.preparationLevel}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full" 
                      style={{ width: `${nextExam.preparationLevel}%` }}
                    ></div>
                  </div>
                </div>
                {/* Done tasks overview safely guarded */}
                <div className="mt-3 flex gap-4 text-xs font-semibold text-slate-500">
                  <span>Tasks: {(nextExam.tasks || []).filter(t => t.done).length} / {(nextExam.tasks || []).length} Done</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 border border-dashed border-slate-200 rounded-xl">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm">No upcoming exams configured</p>
                <button 
                  onClick={() => setActiveTab('exams')}
                  className="mt-2 text-xs text-indigo-600 font-semibold hover:underline"
                >
                  Create Exam Plan &rarr;
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">Syllabus mastering score:</span>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold font-mono">
              {syllabusStats.completedCount} topics reviewed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}