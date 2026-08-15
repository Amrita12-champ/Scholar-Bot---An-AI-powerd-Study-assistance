import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  CheckSquare, 
  Square, 
  TrendingUp, 
  Sparkles,
  Loader2 
} from 'lucide-react';

export default function Exams({ user, exams = [], onRefresh }) {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [preparationLevel, setPreparationLevel] = useState(50);
  const [submitting, setSubmitting] = useState(false);

  // New task temp input mapped by examId
  const [newTaskText, setNewTaskText] = useState({});

  const subjectsList = ['Mathematics', 'Physics', 'Computer Science', 'Language', 'Other'];

  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          title: title.trim(),                   // ✅ Fixed: Variable reference
          subject: subject,                     // ✅ Fixed: Variable reference
          preparationLevel: preparationLevel,   // ✅ Fixed: Variable reference
          date: `${date}T00:00:00`,             // ✅ Fixed: Variable reference to LocalDateTime
          tasksJson: "[]"
        })
      });

      if (response.ok) {
        setTitle('');
        setDate('');
        setPreparationLevel(50);
        setIsCreating(false);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Failed to plan exam:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateExam = async (examId, updatedFields) => {
    try {
      const exam = exams.find(e => e.id === examId);
      if (!exam) return;

      // Prepare fields to maintain structural integrity with the backend requirements
      let payload = {
        ...exam,
        ...updatedFields
      };

      // If the frontend modifies tasks, serialize it back to string storage form
      if (updatedFields.tasks) {
        payload.tasksJson = JSON.stringify(updatedFields.tasks);
      }

      const response = await fetch(`/api/exams/${examId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Failed to update exam wrapper:', err);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!confirm('Are you sure you want to remove this exam planner?')) return;
    try {
      const response = await fetch(`/api/exams/${examId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Failed to delete exam:', err);
    }
  };

  const handleToggleTask = async (examId, taskId) => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;

    // Safely look up tasks array representation
    let rawTasks = [];
    try {
      rawTasks = exam.tasks || JSON.parse(exam.tasksJson || "[]");
    } catch (e) {
      console.error(e);
    }

    const updatedTasks = rawTasks.map(t => {
      if (t.id === taskId) {
        return { ...t, done: !t.done };
      }
      return t;
    });

    const doneCount = updatedTasks.filter(t => t.done).length;
    const computedLevel = updatedTasks.length > 0 
      ? Math.min(100, Math.max(0, Math.round((doneCount / updatedTasks.length) * 100)))
      : exam.preparationLevel;

    await handleUpdateExam(examId, {
      tasks: updatedTasks,
      preparationLevel: Math.max(exam.preparationLevel, computedLevel)
    });
  };

  const handleAddTask = async (examId) => {
    const text = newTaskText[examId];
    if (!text || !text.trim()) return;

    const exam = exams.find(e => e.id === examId);
    if (!exam) return;

    let rawTasks = [];
    try {
      rawTasks = exam.tasks || JSON.parse(exam.tasksJson || "[]");
    } catch (e) {
      console.error(e);
    }

    const newTask = {
      id: 't-' + Math.random().toString(36).substring(2, 5),
      text: text.trim(),
      done: false
    };

    const updatedTasks = [...rawTasks, newTask];

    await handleUpdateExam(examId, {
      tasks: updatedTasks
    });

    setNewTaskText({
      ...newTaskText,
      [examId]: ''
    });
  };

  const handleDeleteTask = async (examId, taskId) => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;

    let rawTasks = [];
    try {
      rawTasks = exam.tasks || JSON.parse(exam.tasksJson || "[]");
    } catch (e) {
      console.error(e);
    }

    const updatedTasks = rawTasks.filter(t => t.id !== taskId);

    await handleUpdateExam(examId, {
      tasks: updatedTasks
    });
  };

  return (
    <div id="exams-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Exam Prep Planner</h1>
          <p className="text-sm text-slate-500 mt-1">
            Build checklists of prep actions, slide your confidence scores, and schedule test milestones.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/10 flex items-center gap-1.5 self-start transition"
        >
          <Plus className="w-4 h-4" /> {isCreating ? 'View Active Plans' : 'Configure Exam Goal'}
        </button>
      </div>

      {isCreating ? (
        /* Create Exam Goal Card */
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm max-w-2xl">
          <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-600" /> Structure Upcoming Exam
          </h2>

          <form onSubmit={handleCreateExam} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Exam Name / Target</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., AP Calculus BC Midterm"
                  required
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Exam Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Subject Topic</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-slate-700"
                >
                  {subjectsList.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>Current Confidence level</span>
                  <span className="text-indigo-600 font-mono">{preparationLevel}%</span>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={preparationLevel}
                    onChange={(e) => setPreparationLevel(Number(e.target.value))}
                    className="flex-1 accent-indigo-600 bg-slate-100 h-2 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/10 flex items-center gap-1.5"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Plan Exam Goal
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Exams Grid view */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.length > 0 ? (
            exams.map((exam) => {
              const daysLeft = Math.ceil((new Date(exam.date).getTime() - Date.now()) / (1000 * 3600 * 24));
              const isUrgent = daysLeft <= 3 && daysLeft >= 0;

              // Safely pull checklist parsed array representation out of decoupled string field
              let parsedTasks = [];
              try {
                parsedTasks = exam.tasks || JSON.parse(exam.tasksJson || "[]");
              } catch(err) {
                console.error(err);
              }

              // Update the in-memory reference context dynamically
              exam.tasks = parsedTasks;

              return (
                <div 
                  key={exam.id} 
                  id={`exam-card-${exam.id}`}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4"
                >
                  {/* Top line info */}
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full inline-block">
                          {exam.subject}
                        </span>
                        <h3 className="font-bold text-slate-800 text-base mt-2">{exam.title}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-slate-500 block">
                          {new Date(exam.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {daysLeft >= 0 ? (
                          <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 inline-block mt-1 font-mono ${
                            isUrgent ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-500'
                          }`}>
                            {daysLeft} days remaining
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-semibold block mt-1">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Confidence Slider */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
                        <span>Preparation Confidence level</span>
                        <span className="font-mono text-indigo-600 font-bold">{exam.preparationLevel}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={exam.preparationLevel}
                        onChange={(e) => handleUpdateExam(exam.id, { preparationLevel: Number(e.target.value) })}
                        className="w-full accent-indigo-600 bg-slate-100 h-1.5 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Checklists sub-tasks */}
                    <div className="mt-5 space-y-3">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Preparation Checklist</span>
                      
                      {/* Checkbox tasks list */}
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {exam.tasks.map((task) => (
                          <div 
                            key={task.id} 
                            onClick={() => handleToggleTask(exam.id, task.id)}
                            className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer select-none group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {task.done ? (
                                <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-400 shrink-0" />
                              )}
                              <span className={`text-xs truncate ${task.done ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                                {task.text}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(exam.id, task.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded transition"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add sub-task input */}
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          value={newTaskText[exam.id] || ''}
                          onChange={(e) => setNewTaskText({
                            ...newTaskText,
                            [exam.id]: e.target.value
                          })}
                          placeholder="Add checklist action..."
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTask(exam.id)}
                          className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                        />
                        <button
                          onClick={() => handleAddTask(exam.id)}
                          className="p-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition shrink-0"
                          title="Add task"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delete exam button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="absolute-text text-[10px] text-slate-400 font-medium">
                      Checklist complete: {exam.tasks.filter(t => t.done).length}/{exam.tasks.length}
                    </span>
                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      className="text-[10px] text-slate-400 hover:text-rose-600 flex items-center gap-1 font-semibold transition ms-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Plan
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center col-span-2 py-12 flex flex-col items-center justify-center">
              <Calendar className="w-16 h-16 text-slate-200 mb-4" />
              <h3 className="font-bold text-slate-700 text-base">Plan Your First Exam Goal</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Don't fly blind. Setup your exam dates, confidence meters, and pre-test check action-items to guarantee results.
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="mt-4 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md"
              >
                Plan Exam Goal
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}