import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  User, 
  Send, 
  Loader2, 
  ArrowLeft, 
  Compass, 
  ShieldAlert,
  Zap
} from 'lucide-react';

export default function AISoftSkills({ user }) {
  const [selectedScenarioId, setSelectedScenarioId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [querying, setQuerying] = useState(false);
  const scrollRef = useRef(null);

  const scenarios = [
    {
      id: 'speaking',
      title: '🎙️ Public Speaking Coach',
      coach: 'Coach Vance',
      description: 'Practice pitching academic concepts. Vance evaluates structure, hooks, body flow, and clarity.',
      initialGreeting: 'Hi there! I am Coach Vance. Ready to practice speaking? Go ahead and type a short presentation or pitch you want feedback on.'
    },
    {
      id: 'time',
      title: '⏳ Procrastination Buster',
      coach: 'Mentor Maya',
      description: 'Resolve executive blockages, design high-quality Pomodoro structures, and establish real study tempos.',
      initialGreeting: 'Hello! I am Maya. Tell me: what specific study objective are you putting off today? Let’s organize a failproof 3-step timeline.'
    },
    {
      id: 'interview',
      title: '🎓 Interview Simulator',
      coach: 'Dr. Evelyn (Examiner)',
      description: 'Practice scholarship/admission situational reviews. Uses STAR grading (Situation, Task, Action, Result).',
      initialGreeting: 'Welcome. I am Dr. Evelyn. I will be conducting your academic interview simulation. Let’s start: "Tell me about a time you encountered a severe academic hurdle, and how you engineered a solution?"'
    },
    {
      id: 'resilience',
      title: '🧘 Exam Resilience Guide',
      coach: 'Coach Kenji (Wellness)',
      description: 'Defuse exam anxiety, overcome disappointment in grades, and learn mindfulness-based grounding.',
      initialGreeting: 'Welcome to this quiet space. I am Kenji. If you are feeling overwhelmed by exams or grades, take a slow deep breath, and let’s talk about it.'
    }
  ];

  const activeScenario = scenarios.find(s => s.id === selectedScenarioId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, querying]);

  const handleSelectScenario = (id) => {
    setSelectedScenarioId(id);
    const scenario = scenarios.find(s => s.id === id);
    setChatHistory([
      {
        id: 'greet',
        sender: 'coach',
        text: scenario.initialGreeting,
        timestamp: new Date().toISOString()
      }
    ]);
    setUserMessage('');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userMessage.trim() || querying) return;

    const messageText = userMessage.trim();
    setUserMessage('');

    // Append student message
    const studentMsg = {
      id: 'st-' + Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toISOString()
    };
    setChatHistory(prev => [...prev, studentMsg]);
    setQuerying(true);

    try {
      const response = await fetch('/api/ai/softskills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: selectedScenarioId,
          chatHistory: chatHistory.map(h => ({ sender: h.sender, text: h.text })),
          userMessage: messageText
        })
      });

      if (response.ok) {
        const data = await response.json();
        const coachMsg = {
          id: 'co-' + Math.random().toString(36).substring(2, 9),
          sender: 'coach',
          text: data.text || 'I apologize, I am temporarily offline.',
          timestamp: new Date().toISOString()
        };
        setChatHistory(prev => [...prev, coachMsg]);
      } else {
        throw new Error('Soft skills simulator failed');
      }
    } catch (err) {
      console.error('Soft skills API error:', err);
      const errMsg = {
        id: 'co-err-' + Math.random().toString(36).substring(2, 9),
        sender: 'coach',
        text: 'I ran into a server error processing your response. Please ensure your Gemini API key is configured properly.',
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, errMsg]);
    } finally {
      setQuerying(false);
    }
  };

  return (
    <div id="softskills-view" className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          AI Soft Skills Coaching Lounges <Sparkles className="w-5 h-5 text-indigo-500 fill-current" />
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Develop essential non-academic skills interactively with highly specialized AI roleplay coaches.
        </p>
      </div>

      {!selectedScenarioId ? (
        /* Scenario Selector Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {scenarios.map((scen) => (
            <div 
              key={scen.id} 
              id={`scenario-${scen.id}`}
              className="bg-white p-5 rounded-2xl border border-slate-150 hover:border-indigo-100 shadow-sm transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div className="space-y-2">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  {scen.title}
                </h3>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                  Coach: {scen.coach}
                </span>
                <p className="text-xs text-slate-500 leading-relaxed pt-1.5">
                  {scen.description}
                </p>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-semibold font-mono uppercase">Roleplay Active</span>
                <button
                  onClick={() => handleSelectScenario(scen.id)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
                >
                  Enter Session &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Active Roleplay Chat Panel */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[520px] justify-between">
          {/* Header */}
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedScenarioId(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
                title="Go back to list"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  {activeScenario.title} • {activeScenario.coach}
                </span>
                <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider block">Coaching Simulation Console</span>
              </div>
            </div>
            <button
              onClick={() => handleSelectScenario(selectedScenarioId)}
              className="text-xs text-slate-500 hover:text-rose-500 font-bold border border-slate-200 hover:border-rose-100 bg-white px-2.5 py-1 rounded-lg transition"
              title="Reset simulation session"
            >
              Reset Session
            </button>
          </div>

          {/* Messages Console logs */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 pr-2 scrollbar-thin">
            {chatHistory.map((msg) => {
              const isCoach = msg.sender === 'coach';
              return (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 max-w-[85%] ${isCoach ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border font-bold text-xs ${
                    isCoach 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                      : 'bg-slate-800 border-slate-700 text-slate-100'
                  }`}>
                    {isCoach ? '👔' : 'S'}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 font-mono block">
                      {isCoach ? activeScenario.coach : 'Student'}
                    </span>
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      isCoach 
                        ? 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none' 
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
                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center border bg-indigo-600 border-indigo-600 text-white shadow-md">
                  👔
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-mono block">{activeScenario.coach} is composing feedback...</span>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none text-slate-400 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span className="text-xs font-medium">Evaluating response hooks...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Form input messaging */}
          <div className="p-4 border-t border-slate-100 shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Compose your spoken concept or respond to the interviewer's situational question..."
                required
                disabled={querying}
                className="flex-1 text-xs p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={querying}
                className="p-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-md transition"
                title="Send reply"
              >
                <Send className="w-4 h-4 fill-current ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
