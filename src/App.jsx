import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import FocusTimer from './components/FocusTimer.jsx';
import Syllabus from './components/Syllabus.jsx';
import Notes from './components/Notes.jsx';
import Exams from './components/Exams.jsx';
import Rooms from './components/Rooms.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import AITutor from './components/AITutor.jsx';
import AIQuiz from './components/AIQuiz.jsx';
import AISoftSkills from './components/AISoftSkills.jsx';
import { Loader2 } from 'lucide-react';
import LoginFrame from './components/LoginFrame';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Modular Data States
  const [notes, setNotes] = useState([]);
  const [syllabus, setSyllabus] = useState([]);
  const [exams, setExams] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [focusSessions, setFocusSessions] = useState([]);

  // Load user from localStorage on init
  useEffect(() => {
    const cachedUser = localStorage.getItem('scholarbot_user');
    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser);
        setUser(parsed);
      } catch (e) {
        console.error('Failed to parse cached user', e);
      }
    }
    setLoading(false);
  }, []);

  // Fetch helpers
  const fetchProfile = useCallback(async (userId) => {
    try {
      const res = await fetch(`/api/profile/${userId}`);
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        localStorage.setItem('scholarbot_user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  }, []);

  const fetchNotes = useCallback(async (userId) => {
  try {
    const res = await fetch(`/api/notes/user/${userId}`); // Matches @GetMapping("/user/{userId}")
    if (res.ok) {
      const data = await res.json();
      setNotes(data);
    }
  } catch (err) {
    console.error('Failed to fetch notes:', err);
  }
}, []);

  const fetchFocusSessions = useCallback(async (userId) => {
    try {
      const res = await fetch(`/api/focus/sessions/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setFocusSessions(data);
      }
    } catch (err) {
      console.error('Failed to fetch focus sessions:', err);
    }
  }, []);

  const fetchSyllabus = useCallback(async (userId) => {
    try {
      const res = await fetch(`/api/syllabus/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSyllabus(data);
      }
    } catch (err) {
      console.error('Failed to fetch syllabus:', err);
    }
  }, []);

  const fetchExams = useCallback(async (userId) => {
    try {
      const res = await fetch(`/api/exams/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setExams(data);
      }
    } catch (err) {
      console.error('Failed to fetch exams:', err);
    }
  }, []);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } catch (err) {
      console.error('Failed to fetch study rooms:', err);
    }
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboards');
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboards:', err);
    }
  }, []);

  // Fetch everything for logged in user (EXCLUDING the profile call itself)
  const fetchAllUserData = useCallback((userId) => {
    if (!userId) return;
    
    fetchNotes(userId);
    fetchSyllabus(userId);
    fetchExams(userId);
    fetchRooms();
    fetchLeaderboard();
    fetchFocusSessions(userId);
  }, [fetchNotes, fetchSyllabus, fetchExams, fetchRooms, fetchLeaderboard, fetchFocusSessions]);

  // Sync data when user changes safely
  useEffect(() => {
    if (user?.id) {
      fetchAllUserData(user.id);
    }
  }, [user?.id, fetchAllUserData]);

  // Handle setting active user upon custom LoginFrame verification success
  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem('scholarbot_user', JSON.stringify(loggedInUser));
    fetchAllUserData(loggedInUser.id);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('scholarbot_user');
    setActiveTab('dashboard');
  };

  // Callback on Pomodoro completed to trigger updates
  const handleFocusComplete = () => {
    if (user?.id) {
      fetchProfile(user.id);
      fetchLeaderboard();
      fetchFocusSessions(user.id);
    }
  };

  if (loading) {
    return (
      <div id="app-loading" className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <span className="text-sm font-semibold text-slate-600">Booting ScholarBot Client...</span>
      </div>
    );
  }

  // ✅ Multi-step authorization interception logic
  if (!user) {
    return <LoginFrame onLoginSuccess={handleLoginSuccess} />;
  }

  // Render main dashboard layout once logged in
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            sessions={focusSessions}
            syllabus={syllabus}
            exams={exams}
            setActiveTab={setActiveTab}
          />
        );
      case 'timer':
        return (
          <FocusTimer 
            user={user} 
            onSessionComplete={handleFocusComplete} 
          />
        );
      case 'syllabus':
        return (
          <Syllabus 
            user={user} 
            syllabus={syllabus} 
            onRefresh={fetchSyllabus} 
          />
        );
      case 'notes':
        return (
          <Notes 
            user={user} 
            notes={notes} 
            onRefresh={fetchNotes} 
          />
        );
      case 'exams':
        return (
          <Exams 
            user={user} 
            exams={exams} 
            onRefresh={fetchExams} 
          />
        );
      case 'rooms':
        return (
          <Rooms 
            user={user} 
            rooms={rooms} 
            onRefresh={fetchRooms} 
          />
        );
      case 'leaderboard':
        return (
          <Leaderboard 
            leaderboard={leaderboard} 
            user={user} 
          />
        );
      case 'tutor':
        return (
          <AITutor 
            user={user} 
            notes={notes} 
            syllabus={syllabus} 
          />
        );
      case 'quiz':
        return (
          <AIQuiz 
            user={user} 
          />
        );
      case 'softskills':
        return (
          <AISoftSkills 
            user={user} 
          />
        );
      default:
        return <div>Tab not found</div>;
    }
  };

  return (
    <div id="scholarbot-root" className="flex h-screen w-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* Main content viewport */}
      <main id="main-viewport" className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto h-full">
          {renderActiveTab()}
        </div>
      </main>
    </div>
  );
}