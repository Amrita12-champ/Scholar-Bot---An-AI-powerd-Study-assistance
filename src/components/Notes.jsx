import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Tag,
  Eye,
  BookOpen
} from 'lucide-react';

export default function Notes({ user, notes = [], onRefresh }) {
  const [selectedNote, setSelectedNote] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Note inputs
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [saving, setSaving] = useState(false);
  const [summarizing, setSummarizing] = useState(false);

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const categories = ['Mathematics', 'Physics', 'Computer Science', 'Language', 'Other'];

  const handleSelectNote = (note) => {
    // Safely parse flashcards string into an array if it's sent as raw JSON string text
    let parsedCards = [];
    if (note.flashcardsJson) {
      try {
        parsedCards = JSON.parse(note.flashcardsJson);
      } catch (e) {
        console.error("Failed to parse note flashcards array payload:", e);
      }
    }

    setSelectedNote({
      ...note,
      flashcards: parsedCards
    });
    setIsCreating(false);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setSelectedNote(null);
    setTitle('');
    setContent('');
    setCategory('Computer Science');
  };
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Enforce a quick check for valid PDF file type signatures
    if (file.type !== "application/pdf") {
      alert("Please select a valid PDF document file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user.id); // passes active user contextual mapping parameter

    try {
      const res = await fetch("/api/notes/upload-pdf", {
        method: "POST",
        body: formData, // No standard headers needed; browser handles boundaries
      });

      const data = await res.json();
      if (res.ok) {
        alert("PDF uploaded successfully!");
        onRefresh(user.id); // trigger your state hook refresh macro to show the new card note list item
      } else {
        alert(data.error || "Failed to parse PDF note.");
      }
    } catch (err) {
      console.error("PDF uploading pipeline error:", err);
      alert("Could not connect to backend file stream.");
    }
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          title: title.trim(),       // ✅ Fixed Variable Reference
          content: content.trim(),   // ✅ Fixed Variable Reference
          category: category         // ✅ Fixed Variable Reference
        })
      });

      if (response.ok) {
        const newNote = await response.json();
        setIsCreating(false);
        if (onRefresh) await onRefresh();
        handleSelectNote(newNote);
      }
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE", // 👈 Make sure method is explicitly DELETE
      });

      if (res.ok) {
        alert("Note deleted successfully!");
        onRefresh(user.id); // 🔄 Refresh your dashboard grid state container
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete note.");
      }
    } catch (err) {
      console.error("Error deleting note:", err);
      alert("Could not connect to the backend.");
    }
  };

  const handleAISummarize = async () => {
    if (!selectedNote) return;
    setSummarizing(true);
    try {
      const response = await fetch(`/api/notes/${selectedNote.id}/ai-summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const updatedNote = await response.json();
        handleSelectNote(updatedNote);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Failed to summarize note:', err);
    } finally {
      setSummarizing(false);
    }
  };

  return (
      <div id="notes-view" className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Note Summarizer</h1>
          <p className="text-sm text-slate-500 mt-1">
            Draft study guides, then utilize Gemini to trigger automatic conceptual summaries and interactive flashcard review decks.
          </p>
        </div>
        {/* pdf button */}
        <div className="flex flex-col gap-2 p-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <label className="text-xs font-bold text-slate-500">Or import existing study documents:</label>
          <input
              type="file"
              accept=".pdf"
              onChange={handlePdfUpload}
              className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Notes list left panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[550px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" /> Study Guides ({notes.length})
              </h2>
              <button
                  onClick={handleCreateNew}
                  className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
                  title="Create New Note"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {notes.length > 0 ? (
                  notes.map((note) => (
                      <button
                          key={note.id}
                          id={`note-item-${note.id}`}
                          onClick={() => handleSelectNote(note)}
                          className={`w-full p-4 text-left rounded-xl border transition-all duration-200 block ${
                              selectedNote?.id === note.id
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10'
                                  : 'bg-slate-50/50 border-slate-100 text-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        selectedNote?.id === note.id
                            ? 'bg-indigo-700 text-indigo-100'
                            : 'bg-slate-200 text-slate-600'
                    }`}>
                      {note.category}
                    </span>
                          <span className={`text-[10px] font-mono ${selectedNote?.id === note.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {note.timestamp ? new Date(note.timestamp).toLocaleDateString() : new Date().toLocaleDateString()}
                    </span>
                        </div>
                        <h3 className="font-bold text-sm mt-2 truncate">{note.title}</h3>
                        <p className={`text-xs mt-1 line-clamp-2 ${selectedNote?.id === note.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {note.content}
                        </p>
                      </button>
                  ))
              ) : (
                  <div className="text-center py-12 text-slate-400">
                    <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold">No study guides</p>
                    <button
                        onClick={handleCreateNew}
                        className="mt-2 text-xs text-indigo-600 font-semibold hover:underline"
                    >
                      Create note &rarr;
                    </button>
                  </div>
              )}
            </div>
          </div>

          {/* Note detailed editor/summarizer panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm md:col-span-2 flex flex-col h-[550px] overflow-y-auto">
            {isCreating ? (
                /* Creating Note Form */
                <form onSubmit={handleSaveNote} className="space-y-4 h-full flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-800 text-base">New Study Note</h3>
                    <div className="flex gap-2">
                      <button
                          type="button"
                          onClick={() => setIsCreating(false)}
                          className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                          type="submit"
                          disabled={saving}
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/10 flex items-center gap-1.5"
                      >
                        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Save Note
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 block">Note Title</label>
                      <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g., Fundamentals of DNS Handshakes"
                          required
                          className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 block">Note Category</label>
                      <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full text-xs p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-slate-700"
                      >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1 flex-1 flex flex-col">
                    <label className="text-xs font-bold text-slate-500 block">Notes Content</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Paste syllabus descriptions, lecture notes, textbook summaries, or custom study drafts here..."
                        required
                        className="w-full text-xs p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 flex-1 resize-none"
                    />
                  </div>
                </form>
            ) : selectedNote ? (
                /* Selected Note View */
                <div className="space-y-5 h-full flex flex-col justify-between">
                  {/* Note view header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                    <div>
                      <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {selectedNote.category}
                    </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                      {selectedNote.timestamp ? new Date(selectedNote.timestamp).toLocaleDateString() : new Date().toLocaleDateString()}
                    </span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg mt-1">{selectedNote.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                          onClick={() => handleDeleteNote(selectedNote.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          title="Delete Note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Note core content scroll block */}
                  <div className="flex-1 overflow-y-auto space-y-5 pr-1">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">Original Note Draft</span>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedNote.content}</p>
                    </div>

                    {/* AI Summary / Flashcards Block */}
                    {selectedNote.summary ? (
                        <div className="space-y-4">
                          {/* Concept Summary block */}
                          <div className="p-4 bg-indigo-50/40 border border-indigo-100/50 rounded-2xl">
                            <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-sm mb-2">
                              <Sparkles className="w-4 h-4 fill-current animate-pulse" />
                              <span>AI Concept Summary</span>
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{selectedNote.summary}</p>
                          </div>

                          {/* Flippable Flashcards Section */}
                          {selectedNote.flashcards && selectedNote.flashcards.length > 0 && (
                              <div className="space-y-3">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">AI Study Flashcards</span>

                                {/* The Flippable Card */}
                                <div
                                    onClick={() => setIsFlipped(!isFlipped)}
                                    className="h-44 w-full bg-slate-900 text-white rounded-2xl cursor-pointer shadow-md flex flex-col items-center justify-center p-6 text-center select-none relative transition hover:brightness-105 active:scale-98 border border-slate-800"
                                >
                          <span className="absolute top-4 left-4 text-[10px] bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-bold">
                            Card {currentCardIndex + 1} of {selectedNote.flashcards.length}
                          </span>
                                  <span className="absolute top-4 right-4 text-[9px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <RotateCcw className="w-3 h-3" /> Click to Flip
                          </span>

                                  <div className="max-w-md">
                                    {isFlipped ? (
                                        <div className="space-y-1">
                                          <span className="text-[9px] text-emerald-400 uppercase font-bold tracking-widest block">Answer</span>
                                          <p className="text-sm font-bold text-slate-100 leading-relaxed">
                                            {selectedNote.flashcards[currentCardIndex].back}
                                          </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                          <span className="text-[9px] text-indigo-400 uppercase font-bold tracking-widest block">Question</span>
                                          <p className="text-sm font-bold text-slate-200 leading-relaxed">
                                            {selectedNote.flashcards[currentCardIndex].front}
                                          </p>
                                        </div>
                                    )}
                                  </div>
                                </div>

                                {/* Flashcards navigators */}
                                <div className="flex items-center justify-between">
                                  <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsFlipped(false);
                                        setCurrentCardIndex(prev => Math.max(0, prev - 1));
                                      }}
                                      disabled={currentCardIndex === 0}
                                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-semibold disabled:opacity-40"
                                  >
                                    <ChevronLeft className="w-4 h-4" /> Previous Card
                                  </button>
                                  <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsFlipped(false);
                                        setCurrentCardIndex(prev => Math.min(selectedNote.flashcards.length - 1, prev + 1));
                                      }}
                                      disabled={currentCardIndex === selectedNote.flashcards.length - 1}
                                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-semibold disabled:opacity-40"
                                  >
                                    Next Card <ChevronRight className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                          )}
                        </div>
                    ) : (
                        /* AI summarize missing splash */
                        <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center space-y-3">
                          <Sparkles className="w-8 h-8 text-indigo-400 mx-auto fill-indigo-50" />
                          <div>
                            <h4 className="font-bold text-slate-700 text-sm">Boost this guide with AI!</h4>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                              Use Gemini to summarize these textbook details into clean concept points and custom flashcards.
                            </p>
                          </div>
                          <button
                              onClick={handleAISummarize}
                              disabled={summarizing}
                              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 flex items-center gap-1.5 mx-auto transition"
                          >
                            {summarizing ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Summarizing...</span>
                                </>
                            ) : (
                                <>
                                  <Sparkles className="w-4 h-4 fill-current" />
                                  <span>AI Summarize & Study Cards</span>
                                </>
                            )}
                          </button>
                        </div>
                    )}
                  </div>
                </div>
            ) : (
                /* Initial empty state view */
                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-6">
                  <BookOpen className="w-16 h-16 text-slate-200 mb-4" />
                  <h3 className="font-bold text-slate-700 text-base">Select a Study Note</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Review lecture logs, paste text snippets, or generate flashcards instantly using ScholarBot's AI.
                  </p>
                  <button
                      onClick={handleCreateNew}
                      className="mt-4 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/15"
                  >
                    Create New Study Guide
                  </button>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}