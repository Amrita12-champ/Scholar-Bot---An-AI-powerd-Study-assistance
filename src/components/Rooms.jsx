import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Send, 
  MessageSquare, 
  Radio, 
  Smile, 
  Laptop,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

export default function Rooms({ user, rooms = [], onRefresh }) {
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [joining, setJoining] = useState(false);
  const chatBottomRef = useRef(null);

  // Poll for room chats & active status updates when inside a room
  useEffect(() => {
    let intervalId = null;
    if (activeRoomId) {
      intervalId = setInterval(() => {
        if (onRefresh) onRefresh();
      }, 4000); // Poll every 4s for fresh chat messages
    }
    return () => clearInterval(intervalId);
  }, [activeRoomId]);

  // Scroll to bottom of chats on room change or new messages
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeRoomId, rooms]);

  const activeRoom = rooms.find(r => r.id === activeRoomId);

  const handleJoinRoom = async (roomId) => {
    setJoining(true);
    try {
      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          avatar: user.avatar,
          xp: user.xp
        })
      });

      if (response.ok) {
        setActiveRoomId(roomId);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Failed to join study room:', err);
    } finally {
      setJoining(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !activeRoomId) return;

    const messageToSend = chatMessage.trim();
    setChatMessage('');

    try {
      const response = await fetch(`/api/rooms/${activeRoomId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: user.name,
          text: messageToSend
        })
      });

      if (response.ok) {
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Failed to send chat:', err);
    }
  };

  return (
    <div id="rooms-view" className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cooperative Study Halls</h1>
        <p className="text-sm text-slate-500 mt-1">
          Study alongside peer students worldwide in quiet focus halls. Share progress updates, motivate each other, and exchange notes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Rooms Explorer List */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 lg:col-span-1 h-fit">
          <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-indigo-500 animate-pulse" /> Active Study Halls
          </h2>

          <div className="space-y-3">
            {rooms.map((room) => {
              const isCurrent = activeRoomId === room.id;
              return (
                <div
                  key={room.id}
                  id={`room-tile-${room.id}`}
                  className={`p-4 rounded-xl border transition-all duration-250 flex flex-col justify-between ${
                    isCurrent 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                      : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-sm flex items-center gap-1.5">
                      {room.name}
                    </h3>
                    <p className={`text-xs mt-1 leading-relaxed ${isCurrent ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {room.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className={`text-[10px] font-mono flex items-center gap-1 font-bold ${isCurrent ? 'text-indigo-200' : 'text-slate-400'}`}>
                      <Users className="w-3.5 h-3.5" /> {room.members ? room.members.length : 0} present
                    </span>

                    <button
                      onClick={() => handleJoinRoom(room.id)}
                      disabled={isCurrent || joining}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                        isCurrent
                          ? 'bg-indigo-700 text-white cursor-default border border-indigo-55/30'
                          : 'bg-slate-800 hover:bg-slate-900 text-white shadow-sm'
                      }`}
                    >
                      {isCurrent ? 'Active' : 'Enter Hall'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Room details - Members and Chat logs */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 flex flex-col h-[520px]">
          {activeRoom ? (
            <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-150 h-full">
              {/* Chat column */}
              <div className="flex-1 flex flex-col h-full justify-between p-5 min-w-0">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1">
                      {activeRoom.name} Study Chat
                    </h3>
                    <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block mt-0.5">Live cooperative study log</span>
                  </div>
                </div>

                {/* Messages Box */}
                <div className="flex-1 overflow-y-auto space-y-3.5 py-4 my-2 pr-1 scrollbar-thin">
                  {activeRoom.chat && activeRoom.chat.map((msg) => {
                    const isSelf = msg.userName === user.name;
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col max-w-[85%] ${isSelf ? 'ml-auto items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold text-slate-500 font-sans">
                            {msg.userName}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          isSelf 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-slate-100 text-slate-800 rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatBottomRef} />
                </div>

                {/* Form sending chat */}
                <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 shrink-0 border-t border-slate-100">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a word of support or asking a question..."
                    required
                    className="flex-1 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition"
                    title="Send message"
                  >
                    <Send className="w-4 h-4 fill-current ml-0.5" />
                  </button>
                </form>
              </div>

              {/* Members column */}
              <div className="w-full md:w-56 p-5 flex flex-col h-full bg-slate-50/40 shrink-0">
                <h4 className="font-bold text-slate-600 text-[10px] uppercase tracking-wider mb-3">
                  Present Scholars ({activeRoom.members ? activeRoom.members.length : 0})
                </h4>

                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                  {activeRoom.members && activeRoom.members.map((member) => (
                    <div key={member.userId} className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img 
                          src={member.avatar} 
                          alt={member.userName} 
                          className="w-9 h-9 rounded-full border border-slate-200 bg-slate-100"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-800 truncate block">
                            {member.userName}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-semibold block uppercase tracking-wider flex items-center gap-1 mt-0.5">
                          <Laptop className="w-3 h-3 text-slate-400" />
                          {member.currentActivity || 'Active learning'}
                        </span>
                        <span className="text-[9px] text-indigo-500 font-mono font-bold block">
                          XP: {member.xp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Join room missing splash */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Users className="w-16 h-16 text-slate-200 mb-4" />
              <h3 className="font-bold text-slate-700 text-base">Select & Enter a Study Hall</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Connect with active scholars in real time! Select one of our designated course libraries on the left to join.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
