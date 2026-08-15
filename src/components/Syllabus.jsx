import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Search, 
  Filter 
} from 'lucide-react';

export default function Syllabus({ user, syllabus = [], onRefresh }) {
  const [subject, setSubject] = useState('Computer Science');
  const [chapter, setChapter] = useState('');
  const [topic, setTopic] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!chapter.trim() || !topic.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          subject,
          chapter,
          topic,
          status: 'pending'
        })
      });

      if (response.ok) {
        setChapter('');
        setTopic('');
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Failed to add syllabus item:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (itemId, newStatus) => {
    try {
      const response = await fetch(`/api/syllabus/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const response = await fetch(`/api/syllabus/${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Failed to delete topic:', err);
    }
  };

  // Grouping and Filtering
  const filteredSyllabus = syllabus.filter(item => {
    const matchesSearch = item.subject.toLowerCase().includes(search.toLowerCase()) || 
                          item.chapter.toLowerCase().includes(search.toLowerCase()) || 
                          item.topic.toLowerCase().includes(search.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && item.status === filterStatus;
  });

  const getStatusIcon = (status) => {
    switch(status) {
      case 'mastered': 
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'in_progress': 
        return <Clock className="w-4 h-4 text-indigo-500" />;
      default: 
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

 const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'mastered': 
        return 'bg-emerald-50 text-emerald-700 border-emerald-100'; // Fixed 55 -> 50
      case 'in_progress': 
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';  // Fixed 55 -> 50
      default: 
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'mastered': return 'Mastered';
      case 'in_progress': return 'In Progress';
      default: return 'Pending';
    }
  };

  const subjectsList = ['Mathematics', 'Physics', 'Computer Science', 'Language', 'Other'];

  return (
    <div id="syllabus-view" className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Syllabus Tracker</h1>
        <p className="text-sm text-slate-500 mt-1">
          Map your academic courses into chapters and topics, review preparedness levels, and maintain structural progress.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topic logger */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-fit">
          <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" /> Log Course Topic
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">Course Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
              >
                {subjectsList.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">Chapter / Unit Name</label>
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="e.g., Chapter 3: Calculus Fundamentals"
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">Specific Topic / Concept</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Integration by Parts proofs"
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 transition"
            >
              <Plus className="w-4 h-4" /> Add Topic to Syllabus
            </button>
          </form>
        </div>

        {/* Syllabus Table / List */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 flex flex-col min-h-[400px]">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subjects, chapters, topics..."
                className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-slate-600"
              >
                <option value="all">All Milestones</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="mastered">Mastered</option>
              </select>
            </div>
          </div>

          {/* List display */}
          <div className="flex-1 overflow-y-auto space-y-3 max-h-[500px] pr-1">
            {filteredSyllabus.length > 0 ? (
              filteredSyllabus.map((item) => (
                <div 
                  key={item.id} 
                  id={`syllabus-item-${item.id}`}
                  className="p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 transition flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {item.subject}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {item.chapter}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 mt-1 truncate">{item.topic}</h3>
                    {item.lastReviewed && (
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">
                        Reviewed: {new Date(item.lastReviewed).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status switcher dropdown */}
                    <div className="flex flex-col items-end">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusBadgeClass(item.status)} flex items-center gap-1`}>
                        {getStatusIcon(item.status)}
                        {getStatusLabel(item.status)}
                      </span>
                      <div className="flex gap-1 mt-1.5">
                        {item.status !== 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'pending')}
                            className="text-[9px] font-bold text-slate-500 hover:text-slate-800 px-1.5 py-0.5 border border-slate-200 rounded bg-white hover:bg-slate-50"
                            title="Set to Pending"
                          >
                            Pending
                          </button>
                        )}
                        {item.status !== 'in_progress' && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'in_progress')}
                            className="text-[9px] font-bold text-indigo-500 hover:text-indigo-700 px-1.5 py-0.5 border border-indigo-100 rounded bg-white hover:bg-indigo-50"
                            title="Set to In Progress"
                          >
                            In Progress
                          </button>
                        )}
                        {item.status !== 'mastered' && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'mastered')}
                            className="text-[9px] font-bold text-emerald-600 hover:text-emerald-700 px-1.5 py-0.5 border border-emerald-100 rounded bg-white hover:bg-emerald-50"
                            title="Set to Mastered"
                          >
                            Mastered
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Delete option */}
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition self-start"
                      title="Delete topic"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 border border-dashed border-slate-150 rounded-2xl flex flex-col items-center justify-center">
                <BookOpen className="w-12 h-12 text-slate-200 mb-3" />
                <p className="text-sm font-semibold">No syllabus topics listed</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  {search ? 'Try refining your search keyword' : 'Create subjects above to organize your exam preparations.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
