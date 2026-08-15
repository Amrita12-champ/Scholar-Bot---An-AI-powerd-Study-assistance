import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Flame, 
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function FocusTimer({ user, onSessionComplete }) {
  const [category, setCategory] = useState('Computer Science');
  const [notes, setNotes] = useState('');
  const [presetMinutes, setPresetMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [saving, setSaving] = useState(false);

  const timerRef = useRef(null);
  const initialTime = presetMinutes * 60;

  // Sync timer when preset minutes changes (and not running)
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(presetMinutes * 60);
    }
  }, [presetMinutes]);

  // Main countdown effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            handleTimerFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(presetMinutes * 60);
    setIsCompleted(false);
  };

  const adjustMinutes = (amount) => {
    if (isRunning) return;
    const newVal = Math.max(1, Math.min(180, presetMinutes + amount));
    setPresetMinutes(newVal);
  };

  const handleTimerFinish = async () => {
    await saveSession(presetMinutes, true);
  };

  const handleEarlyComplete = async () => {
    // If they studied at least 1 minute, allow recording the actual minutes spent
    const minutesSpent = Math.max(1, Math.round((initialTime - timeLeft) / 60));
    setIsRunning(false);
    await saveSession(minutesSpent, true);
  };

  const saveSession = async (minutes, wasCompleted) => {
    setSaving(true);
    try {
      const response = await fetch('/api/focus/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          duration: minutes,
          category,
          notes: notes || `Focused on ${category}`,
          completed: wasCompleted
        })
      });

      if (response.ok) {
        const data = await response.json();
        const addedXP = Math.floor(minutes * 1.5);
        const addedPoints = Math.floor(minutes * 1.0);
        
        setXpEarned(addedXP);
        setPointsEarned(addedPoints);
        setIsCompleted(true);
        setNotes('');

        // Callback to refresh profile/sessions in global app state
        if (onSessionComplete) {
          onSessionComplete();
        }
      }
    } catch (error) {
      console.error('Failed to save focus session:', error);
    } finally {
      setSaving(false);
    }
  };

  // Circular progress calculation
  const totalDuration = presetMinutes * 60;
  const progressPercent = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;
  
  // Format MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const categories = ['Mathematics', 'Physics', 'Computer Science', 'Language', 'Other'];

  return (
    <div id="focus-timer-view" className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Interactive Pomodoro Studio</h1>
        <p className="text-sm text-slate-500 mt-1">
          Lock in your session, gain Scholar XP points, and climb the Leaderboards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Settings & Configuration */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm md:col-span-2 space-y-5">
          <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">Configure Focus Block</h2>

          {/* Category selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 block">Active Study Subject</label>
            <div className="grid grid-cols-1 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => !isRunning && setCategory(cat)}
                  disabled={isRunning}
                  className={`px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition flex items-center justify-between border ${
                    category === cat 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50'
                  }`}
                >
                  <span>{cat}</span>
                  {category === cat && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Session Notes */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 block">Goal / Task Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isRunning || isCompleted}
              placeholder="What specific outcome are you working towards?"
              rows="3"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-55"
            />
          </div>

          {/* Preset Customization */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 block">Block Duration</label>
            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
              <button
                onClick={() => adjustMinutes(-5)}
                disabled={isRunning || presetMinutes <= 5}
                className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 shadow-sm"
              >
                <Minus className="w-4 h-4 text-slate-600" />
              </button>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {presetMinutes} minutes
              </span>
              <button
                onClick={() => adjustMinutes(5)}
                disabled={isRunning || presetMinutes >= 180}
                className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 shadow-sm"
              >
                <Plus className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            <div className="flex gap-2 pt-1">
              {[15, 25, 50, 90].map((preset) => (
                <button
                  key={preset}
                  onClick={() => !isRunning && setPresetMinutes(preset)}
                  disabled={isRunning}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                    presetMinutes === preset
                      ? 'bg-slate-800 border-slate-800 text-white'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {preset}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* The Animated Clock Face */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm md:col-span-3 flex flex-col items-center justify-center min-h-[350px]">
          {isCompleted ? (
            <div id="focus-completed-card" className="text-center py-6 px-4 space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto border border-emerald-100 shadow-inner">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Focus Block Completed!</h3>
                <p className="text-xs text-slate-400 mt-1">Outstanding persistence. Your progress is synced to the cloud.</p>
              </div>

              {/* Award Board */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 max-w-xs mx-auto grid grid-cols-2 gap-3 divide-x divide-slate-200">
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">XP gained</span>
                  <span className="text-xl font-extrabold text-indigo-600 font-mono">+{xpEarned} XP</span>
                </div>
                <div className="text-center pl-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">Points earned</span>
                  <span className="text-xl font-extrabold text-amber-500 font-mono">🪙 +{pointsEarned}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleReset}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition"
                >
                  Start Another Block
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              {/* Circular SVG Timer */}
              <div className="relative w-64 h-64 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Track circle */}
                  <circle
                    cx="128"
                    cy="128"
                    r="108"
                    className="stroke-slate-100"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="128"
                    cy="128"
                    r="108"
                    className={`stroke-indigo-600 transition-all duration-300 ${isRunning ? 'animate-none' : ''}`}
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 108}
                    strokeDashoffset={2 * Math.PI * 108 * (1 - progressPercent / 100)}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Inner countdown readout */}
                <div className="absolute text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block mb-1">
                    {category}
                  </span>
                  <span className="text-4xl font-extrabold font-mono text-slate-800 tracking-tight block">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-[10px] bg-indigo-50 border border-indigo-100/50 text-indigo-600 px-2 py-0.5 rounded-full font-bold inline-block mt-2 font-mono">
                    {Math.round(presetMinutes)}m session
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4 mt-8">
                {/* Reset button */}
                <button
                  onClick={handleReset}
                  disabled={timeLeft === initialTime}
                  className="p-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-full hover:bg-slate-100 hover:text-slate-800 transition shadow-sm disabled:opacity-50"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Main Play/Pause Button */}
                <button
                  onClick={handleStartPause}
                  className={`p-5 rounded-full text-white transition shadow-lg transform hover:scale-105 ${
                    isRunning 
                      ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' 
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                  }`}
                >
                  {isRunning ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                </button>

                {/* Force complete button */}
                <button
                  onClick={handleEarlyComplete}
                  disabled={timeLeft === initialTime || saving}
                  className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full hover:bg-emerald-100 hover:text-emerald-700 transition shadow-sm disabled:opacity-50"
                  title="Complete Session & Claim points"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>

              {/* Status footer line */}
              <div className="mt-6 text-center">
                {isRunning ? (
                  <p className="text-xs text-indigo-500 font-semibold animate-pulse flex items-center justify-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    Deep focus active... Keep distractions away!
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">
                    {timeLeft === initialTime ? 'Press play to launch your study timer' : 'Timer is paused'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
