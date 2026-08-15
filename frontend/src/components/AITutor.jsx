import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquareCode, 
  Send, 
  Sparkles, 
  Loader2, 
  BookOpen, 
  GraduationCap, 
  Compass 
} from 'lucide-react';

export default function AITutor({ user, notes = [], syllabus = [] }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am ScholarBot, your elite academic tutor. I can see your study notes and course tracker contextually. How can I assist you with your concepts or revision today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [querying, setQuerying] = useState(false);
  const scrollRef = useRef(null);

  // Automatically scroll down on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, querying]);

  const handleSendMessage = async (e, customText = '') => {
    if (e) e.preventDefault();
    
    const textToSend = customText || inputText;
    if (!textToSend.trim() || querying) return;

    if (!customText) setInputText('');

    // Append student message
    const userMsgId = 'msg-' + Math.random().toString(36).substring(2, 9);
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setQuerying(true);

    try {
      // Map notes and syllabus context for server context inclusion
      const notesContext = notes.map(n => ({ title: n.title, content: n.content, category: n.category }));
      const syllabusContext = syllabus.map(s => ({ subject: s.subject, chapter: s.chapter, topic: s.topic, status: s.status }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          notesContext,
          syllabusContext
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsg = {
          id: 'ai-' + Math.random().toString(36).substring(2, 9),
          sender: 'ai',
          text: data.text || "I apologize, but I was unable to compile an answer at this time.",
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error('Endpoint returned error status');
      }
    } catch (err) {
      console.error('Failed to chat with AI Tutor:', err);
      const errMsg = {
        id: 'err-' + Math.random().toString(36).substring(2, 9),
        sender: 'ai',
        text: "I ran into a server communication error. Please make sure your server is online or your Gemini API key is configured correctly in Settings Secrets.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setQuerying(false);
    }
  };

  const starters = [
    { text: "Break down the concepts of TCP/IP handshakes step-by-step", label: "Explain Handshake" },
    { text: "Give me an active study schedule for my upcoming calculus midterm", label: "Midterm Study Plan" },
    { text: "I am feeling burnt out and procrastinating. Teach me a mindfulness technique to reset.", label: "Beat Procrastination" }
  ];

  return (
    <div id="ai-tutor-view" className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          ScholarBot AI Study Tutor <Sparkles className="w-5 h-5 text-indigo-500 fill-current" />
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Interact with a specialized AI study coach. ScholarBot uses your active course trackers and drafts as context to optimize revisions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left column: Context overview details */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm md:col-span-1 h-fit space-y-4">
          <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-indigo-600" /> Active Tutor Context
          </h2>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            ScholarBot synthesizes the following items automatically to give hyper-focused explanations:
          </p>

          <div className="space-y-2.5">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 w-6 h-6 rounded-lg flex items-center justify-center">
                {notes.length}
              </span>
              <span className="text-xs text-slate-600 font-semibold">Note Guides Connected</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 w-6 h-6 rounded-lg flex items-center justify-center">
                {syllabus.length}
              </span>
              <span className="text-xs text-slate-600 font-semibold">Syllabus Topics Mapped</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-[9px] text-indigo-500 font-bold uppercase block mb-1">Motivator Tip</span>
            <span className="text-[10px] text-slate-500 leading-relaxed block">
              "Create more study guides under the Notes tab to provide richer material for ScholarBot reviews!"
            </span>
          </div>
        </div>

        {/* Chat window */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm md:col-span-3 flex flex-col h-[520px] justify-between">
          {/* Header */}
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquareCode className="w-5 h-5 text-indigo-600" />
              <div>
                <span className="text-xs font-bold text-slate-800 block">Interactive Tutor Console</span>
                <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider block">Powered by Gemini 3.5 Flash</span>
              </div>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold font-mono">
              Online
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 my-1 pr-2 scrollbar-thin">
            {messages.map((msg) => {
              const isAI = msg.sender === 'ai';
              return (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 max-w-[85%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border font-bold text-xs ${
                    isAI 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                      : 'bg-slate-800 border-slate-700 text-slate-100'
                  }`}>
                    {isAI ? '🤖' : 'S'}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 font-mono block">
                      {isAI ? 'ScholarBot' : 'Student'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      isAI 
                        ? msg.isError 
                          ? 'bg-rose-50 border border-rose-100 text-rose-700 rounded-tl-none'
                          : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none font-sans whitespace-pre-wrap'
                        : 'bg-indigo-600 text-white rounded-tr-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}

            {querying && (
              <div className="flex gap-3 max-w-[85%] mr-auto">
                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center border bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10">
                  🤖
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-mono block">ScholarBot is thinking...</span>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none text-slate-400 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span className="text-xs font-medium">Drafting dynamic outline...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Footer & input */}
          <div className="p-4 border-t border-slate-100 shrink-0">
            {/* Quick Starters */}
            {messages.length === 1 && !querying && (
              <div className="flex flex-wrap gap-2 mb-3.5 items-center">
                <Compass className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-1">Quick Queries:</span>
                {starters.map((starter, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(null, starter.text)}
                    className="text-[10px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 hover:border-slate-300 px-2.5 py-1.5 rounded-lg transition"
                  >
                    {starter.label}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask ScholarBot to summarize a topic, draft practice essays, etc..."
                required
                disabled={querying}
                className="flex-1 text-xs p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={querying}
                className="p-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-md transition shrink-0"
                title="Send query"
              >
                <Send className="w-4 h-4 fill-current ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
