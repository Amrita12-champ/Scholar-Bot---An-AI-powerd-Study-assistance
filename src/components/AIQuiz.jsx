import React, { useState } from 'react';
import { 
  Trophy, 
  HelpCircle, 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  RotateCcw,
  BookOpen
} from 'lucide-react';

export default function AIQuiz({ user }) {
  const [topicName, setTopicName] = useState('Computer Science Protocols');
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);
  
  // Quiz taking state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleGenerateQuiz = async (e, customTopic = '') => {
    if (e) e.preventDefault();
    
    const activeTopic = customTopic || topicName;
    if (!activeTopic.trim() || loading) return;

    setLoading(true);
    setQuizData(null);
    setCurrentIndex(0);
    setSelectedAnswerIndex(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizFinished(false);

    try {
      const response = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicName: activeTopic })
      });

      if (response.ok) {
        const data = await response.json();
        setQuizData(data);
      } else {
        throw new Error('Server returned error status');
      }
    } catch (err) {
      console.error('Quiz generation failed:', err);
      alert('Could not generate quiz. Please ensure your GEMINI_API_KEY is configured in Secrets Settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (idx) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswerIndex(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswerIndex === null || isAnswerSubmitted) return;

    const currentQuestion = quizData.questions[currentIndex];
    if (selectedAnswerIndex === currentQuestion.correctIndex) {
      setScore(prev => prev + 1);
    }

    setIsAnswerSubmitted(true);
  };

  const handleNextQuestion = () => {
    setSelectedAnswerIndex(null);
    setIsAnswerSubmitted(false);

    if (currentIndex < quizData.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const quickTopics = [
    'Calculus Integrals',
    'TCP vs UDP Handshakes',
    'Thermodynamics Entropy',
    'French irregular verbs'
  ];

  return (
    <div id="ai-quiz-view" className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI MCQ Practice Testing</h1>
        <p className="text-sm text-slate-500 mt-1">
          Input any educational topic, and ScholarBot will invoke Gemini to compose a challenging 3-question multiple choice quiz with instant explanations.
        </p>
      </div>

      {!quizData && !loading ? (
        /* Setup Quiz State */
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
          <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-600" /> Choose Your Topic
          </h2>

          <form onSubmit={handleGenerateQuiz} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">Enter Custom Study Topic</label>
              <input
                type="text"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="e.g., Computer Network Security Protocols, Quantum Entanglement..."
                required
                className="w-full text-xs p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-slate-700"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10 transition"
            >
              <Sparkles className="w-4 h-4 fill-current" /> Compose MCQ Practice Quiz
            </button>
          </form>

          {/* Quick presets */}
          <div className="pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Try standard revisions:</span>
            <div className="flex flex-wrap gap-2">
              {quickTopics.map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => handleGenerateQuiz(null, topic)}
                  className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600 rounded-xl transition"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : loading ? (
        /* Generating loading view */
        <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <div>
            <h3 className="font-bold text-slate-800 text-base">Composing Challenge Questions...</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              ScholarBot is utilizing Gemini to audit and generate high-quality educational options and step-by-step proofs.
            </p>
          </div>
        </div>
      ) : quizFinished ? (
        /* Final Score Card */
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center space-y-5">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto border border-amber-100 shadow-inner">
            <Trophy className="w-8 h-8 fill-current" />
          </div>

          <div>
            <h2 className="font-bold text-slate-800 text-lg">Quiz Complete!</h2>
            <span className="text-xs text-slate-400 font-mono block mt-0.5">Topic: {quizData.topic}</span>
          </div>

          {/* Scoreboard */}
          <div className="max-w-xs mx-auto p-4 bg-slate-50 border border-slate-100 rounded-2xl grid grid-cols-2 gap-3 divide-x divide-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Correct answers</span>
              <span className="text-2xl font-extrabold text-indigo-600 font-mono">{score} / 3</span>
            </div>
            <div className="pl-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Preparedness</span>
              <span className="text-2xl font-extrabold text-emerald-500 font-mono">
                {Math.round((score / 3) * 100)}%
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setQuizData(null)}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/10 flex items-center gap-1.5 mx-auto transition"
            >
              <RotateCcw className="w-4 h-4" /> Try another topic
            </button>
          </div>
        </div>
      ) : (
        /* Quiz Gameplay Active View */
        <div className="space-y-4">
          {/* Header question tracker */}
          <div className="bg-white px-5 py-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold font-mono">
              Question {currentIndex + 1} of 3
            </span>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-0.5 rounded-full font-bold">
              {quizData.topic}
            </span>
          </div>

          {/* Question & Options */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-extrabold text-slate-800 text-base leading-relaxed flex items-start gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <span>{quizData.questions[currentIndex].question}</span>
            </h3>

            {/* MCQ Options list */}
            <div className="grid grid-cols-1 gap-3">
              {quizData.questions[currentIndex].options.map((option, idx) => {
                const isSelected = selectedAnswerIndex === idx;
                const isCorrectIndex = idx === quizData.questions[currentIndex].correctIndex;

                let btnClass = 'border-slate-200 text-slate-700 hover:bg-slate-50';
                if (isSelected && !isAnswerSubmitted) {
                  btnClass = 'bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold';
                } else if (isAnswerSubmitted) {
                  if (isCorrectIndex) {
                    btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold';
                  } else if (isSelected) {
                    btnClass = 'bg-rose-50 border-rose-400 text-rose-700 font-semibold';
                  } else {
                    btnClass = 'border-slate-100 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswerSubmitted}
                    className={`p-4 rounded-xl text-left text-xs font-medium border transition flex items-center justify-between ${btnClass}`}
                  >
                    <span>{option}</span>
                    <div className="flex items-center gap-1.5">
                      {isAnswerSubmitted && isCorrectIndex && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                      {isAnswerSubmitted && isSelected && !isCorrectIndex && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Grading Trigger or Next Question Navigation */}
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              {!isAnswerSubmitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswerIndex === null}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl disabled:opacity-40 shadow-md shadow-indigo-600/10 transition"
                >
                  Grade Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 bg-slate-850 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  {currentIndex === 2 ? 'Finish Quiz' : 'Next Question'} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Explanation box revealed after grading */}
            {isAnswerSubmitted && (
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5 animate-fade-in text-xs">
                <span className="font-extrabold text-slate-800 uppercase tracking-widest text-[9px] block">
                  Step-by-Step Explanation
                </span>
                <p className="text-slate-600 leading-relaxed font-sans">
                  {quizData.questions[currentIndex].explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
