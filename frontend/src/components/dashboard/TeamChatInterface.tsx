'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../services/api';

export interface ChatMessage {
  id: string;
  senderName: string;
  senderCollegeId: string;
  senderEmail?: string;
  senderSuitColor: string;
  content: string;
  createdAt: string | Date;
}

interface TeamChatInterfaceProps {
  assignedTeam: {
    id: string;
    name: string;
    track?: string;
    tableNumber?: number;
    members: any[];
  };
  currentTicket: any;
  isImpostor?: boolean;
  isCrewmate?: boolean;
}

const QUICK_CHIPS = [
  '👋 Hey Squad! Connected to comms.',
  '💻 Starting feature implementation.',
  '⚙️ Setting up backend API routes.',
  '📊 Finalizing Round 1 PPT slides.',
  '🔍 Pull Request ready for review.',
  '🚀 Round 1 feature shipped!',
];

export default function TeamChatInterface({
  assignedTeam,
  currentTicket,
  isImpostor,
  isCrewmate,
}: TeamChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFloatingOpen, setIsFloatingOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatStorageKey = `amongu_team_chat_${assignedTeam.id}`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Sync messages from localStorage and backend
  const loadMessages = () => {
    try {
      const stored = localStorage.getItem(chatStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }

      // Initial default welcome message if chat is fresh
      const defaultWelcome: ChatMessage = {
        id: `sys_welcome_${assignedTeam.id}`,
        senderName: 'MISSION CONTROL HUD',
        senderCollegeId: 'SYSTEM',
        senderSuitColor: '#06B6D4',
        content: `🛰️ SQUAD FREQUENCY ESTABLISHED: Welcome to ${assignedTeam.name} (Table #${assignedTeam.tableNumber || assignedTeam.id.slice(-2)}). Coordinate your Round 1 presentation, repository workflow, and feature sprint here in real time.`,
        createdAt: new Date().toISOString(),
      };
      setMessages([defaultWelcome]);
      localStorage.setItem(chatStorageKey, JSON.stringify([defaultWelcome]));
    } catch {
      // ignore
    }
  };

  // Backend sync (non-blocking)
  const syncWithBackend = async () => {
    try {
      const res = await apiClient.get(`/teams/${assignedTeam.id}/messages`);
      if (res.data?.success && Array.isArray(res.data.messages) && res.data.messages.length > 0) {
        setMessages((prev) => {
          const mergedMap = new Map<string, ChatMessage>();
          prev.forEach((m) => mergedMap.set(m.id, m));
          res.data.messages.forEach((m: ChatMessage) => mergedMap.set(m.id, m));
          const sorted = Array.from(mergedMap.values()).sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          localStorage.setItem(chatStorageKey, JSON.stringify(sorted));
          return sorted;
        });
      }
    } catch {
      // Offline fallback: keep local messages
    }
  };

  useEffect(() => {
    loadMessages();
    syncWithBackend();

    // 1.5s real-time heartbeat poller
    const interval = setInterval(() => {
      try {
        const stored = localStorage.getItem(chatStorageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setMessages((prev) => {
              if (parsed.length !== prev.length) {
                if (!isFloatingOpen && !isExpanded) {
                  setUnreadCount((c) => c + (parsed.length - prev.length));
                }
                return parsed;
              }
              return prev;
            });
          }
        }
      } catch {
        // ignore
      }
    }, 1500);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === chatStorageKey) {
        loadMessages();
      }
    };

    const handleCustomChatEvent = (e: any) => {
      if (!e.detail || e.detail.teamId === assignedTeam.id) {
        loadMessages();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('amongu_new_chat_message', handleCustomChatEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('amongu_new_chat_message', handleCustomChatEvent);
    };
  }, [assignedTeam.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isExpanded, isFloatingOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isSending) return;

    setIsSending(true);

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      senderName: currentTicket?.name || 'Cadet Explorer',
      senderCollegeId: currentTicket?.collegeId || '210029012000001',
      senderEmail: currentTicket?.email || '',
      senderSuitColor: currentTicket?.avatarColor || (isImpostor ? '#ef4444' : '#06B6D4'),
      content: text,
      createdAt: new Date().toISOString(),
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    if (!textToSend) setInputValue('');

    try {
      localStorage.setItem(chatStorageKey, JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(
        new CustomEvent('amongu_new_chat_message', { detail: { teamId: assignedTeam.id } })
      );

      // Async backend push
      apiClient
        .post(`/teams/${assignedTeam.id}/messages`, {
          content: text,
          senderName: newMsg.senderName,
          senderCollegeId: newMsg.senderCollegeId,
          senderEmail: newMsg.senderEmail,
          senderSuitColor: newMsg.senderSuitColor,
        })
        .catch(() => {});
    } catch {
      // ignore
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (dateInput: string | Date) => {
    try {
      const d = new Date(dateInput);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  const isCurrentCandidate = (msg: ChatMessage) => {
    if (msg.senderCollegeId === 'SYSTEM') return false;
    return (
      (currentTicket?.collegeId && msg.senderCollegeId === currentTicket.collegeId) ||
      (currentTicket?.email && msg.senderEmail?.toLowerCase() === currentTicket.email?.toLowerCase())
    );
  };

  return (
    <>
      {/* 🚀 INLINE FULL-WIDTH TACTICAL SQUAD CHAT SECTION */}
      <section
        id="squad-chat-section"
        aria-label="Squad Tactical Comms"
        className={`au-card rounded-3xl p-5 sm:p-6 space-y-4 border-2 transition-all duration-500 shadow-2xl relative overflow-hidden ${
          isImpostor
            ? 'bg-gradient-to-b from-gray-950/95 via-[#120303] to-black border-red-800/80 shadow-[0_0_35px_rgba(239,68,68,0.2)]'
            : isCrewmate
            ? 'bg-gradient-to-b from-gray-950/95 via-[#011424] to-black border-cyan-800/80 shadow-[0_0_35px_rgba(6,182,212,0.2)]'
            : 'bg-gray-950/95 border-gray-800'
        }`}
      >
        {/* Glow ambient background element */}
        <div
          className={`absolute -bottom-20 -right-20 w-72 h-72 rounded-full blur-3xl pointer-events-none ${
            isImpostor ? 'bg-red-600/10' : 'bg-crew-cyan/10'
          }`}
        />

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-lg border ${
                isImpostor
                  ? 'bg-red-950/90 border-red-500 text-red-300'
                  : 'bg-cyan-950/90 border-crew-cyan text-crew-cyan'
              }`}
            >
              💬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-black px-2 py-0.5 rounded bg-crew-cyan/20 text-crew-cyan border border-crew-cyan/40">
                  SECURE SQUAD CHAT
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-mono text-crew-lime font-bold">
                  <span className="w-2 h-2 rounded-full bg-crew-lime animate-pulse" />
                  LIVE • 4 SQUAD MEMBERS
                </span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl text-white font-bold mt-0.5 flex items-center gap-2">
                <span>{assignedTeam.name}</span>
                <span className="text-gray-400 font-mono text-xs font-normal">
                  ({assignedTeam.id})
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400 bg-black/60 border border-gray-800 px-3 py-1.5 rounded-xl hidden sm:inline-block">
              Table #{assignedTeam.tableNumber || assignedTeam.id.slice(-2)}
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-700 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
            >
              <span>{isExpanded ? 'MINIMIZE ▾' : 'EXPAND CHAT ▴'}</span>
            </button>
          </div>
        </div>

        {/* Chat Body */}
        {isExpanded && (
          <div className="space-y-4">
            {/* Messages Feed Box */}
            <div className="bg-black/80 border border-gray-800/90 rounded-2xl p-4 sm:p-5 h-80 sm:h-96 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-800">
              {messages.map((msg) => {
                const isMe = isCurrentCandidate(msg);
                const isSys = msg.senderCollegeId === 'SYSTEM';

                if (isSys) {
                  return (
                    <div
                      key={msg.id}
                      className="bg-cyan-950/40 border border-crew-cyan/40 text-cyan-200 text-xs font-mono rounded-xl p-3 my-2 text-center shadow"
                    >
                      <span className="text-sm mr-1.5">📡</span>
                      <span>{msg.content}</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%] ${
                      isMe ? 'ml-auto flex-row-reverse' : ''
                    }`}
                  >
                    {/* Teammate Suit Avatar */}
                    <div
                      className="w-7 h-7 rounded-xl border border-black flex items-center justify-center text-xs shrink-0 shadow mt-0.5"
                      style={{ backgroundColor: msg.senderSuitColor || '#06B6D4' }}
                      title={msg.senderName}
                    >
                      🚀
                    </div>

                    <div className={`space-y-1 ${isMe ? 'text-right' : 'text-left'}`}>
                      {/* Name & Timestamp */}
                      <div className="flex items-center gap-1.5 text-[10px] font-mono">
                        <span
                          className={`font-bold ${
                            isMe ? 'text-crew-cyan' : 'text-gray-300'
                          }`}
                        >
                          {msg.senderName}
                        </span>
                        {isMe && (
                          <span className="px-1 py-0.2 bg-crew-cyan text-black rounded text-[9px] font-extrabold">
                            YOU
                          </span>
                        )}
                        <span className="text-gray-500 font-mono">
                          {formatMessageTime(msg.createdAt)}
                        </span>
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`p-3 rounded-2xl text-xs sm:text-sm font-sans leading-relaxed break-words shadow-md ${
                          isMe
                            ? isImpostor
                              ? 'bg-red-950/90 border border-red-500/80 text-white rounded-tr-none'
                              : 'bg-cyan-950/90 border border-crew-cyan/70 text-white rounded-tr-none'
                            : 'bg-gray-900/90 border border-gray-800 text-gray-200 rounded-tl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Tactical Preset Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-gray-500 font-bold tracking-wider block">
                Quick Squad Transmissions:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
                {QUICK_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(chip)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-gray-900/90 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 hover:border-gray-600 transition-all active:scale-95 text-[11px]"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Input Bar */}
            <div className="flex items-center gap-2 pt-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message squad teammates at Table #${assignedTeam.tableNumber || assignedTeam.id.slice(-2)}...`}
                  className={`w-full bg-black/90 border rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-all ${
                    isImpostor
                      ? 'border-gray-800 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-gray-800 focus:border-crew-cyan focus:ring-1 focus:ring-crew-cyan'
                  }`}
                />
              </div>

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isSending || !inputValue.trim()}
                className={`au-btn font-display text-xs sm:text-sm py-3 px-5 rounded-2xl flex items-center gap-1.5 transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
                  isImpostor
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                    : 'bg-crew-cyan hover:bg-cyan-300 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                }`}
              >
                <span>SEND</span>
                <span>↵</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 🛸 FLOATING DOCKED QUICK-ACCESS CHAT BUTTON */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Docked Pop-up Window when Opened */}
        {isFloatingOpen && (
          <div
            className={`w-[90vw] sm:w-96 h-[30rem] rounded-3xl p-4 flex flex-col justify-between border-2 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300 ${
              isImpostor
                ? 'bg-gray-950/95 border-red-700 shadow-[0_0_40px_rgba(239,68,68,0.35)]'
                : 'bg-gray-950/95 border-crew-cyan shadow-[0_0_40px_rgba(6,182,212,0.35)]'
            }`}
          >
            {/* Pop-up Header */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">💬</span>
                <div>
                  <h4 className="font-display text-sm text-white">{assignedTeam.name}</h4>
                  <span className="text-[10px] font-mono text-crew-lime font-bold block">
                    Table #{assignedTeam.tableNumber || assignedTeam.id.slice(-2)} • Online
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsFloatingOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center text-xs font-mono border border-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Pop-up Message Feed */}
            <div className="flex-1 overflow-y-auto space-y-2.5 my-3 p-2 bg-black/60 rounded-xl scrollbar-thin">
              {messages.map((msg) => {
                const isMe = isCurrentCandidate(msg);
                const isSys = msg.senderCollegeId === 'SYSTEM';

                if (isSys) {
                  return (
                    <div
                      key={msg.id}
                      className="bg-cyan-950/40 border border-crew-cyan/30 text-cyan-200 text-[10px] font-mono rounded-lg p-2 text-center"
                    >
                      {msg.content}
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-1.5 max-w-[85%] ${
                      isMe ? 'ml-auto flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0"
                      style={{ backgroundColor: msg.senderSuitColor || '#06B6D4' }}
                    >
                      🚀
                    </div>
                    <div>
                      <div className="text-[9px] font-mono text-gray-400 flex items-center gap-1">
                        <span>{msg.senderName}</span>
                        <span>{formatMessageTime(msg.createdAt)}</span>
                      </div>
                      <div
                        className={`p-2 rounded-xl text-xs leading-relaxed ${
                          isMe
                            ? isImpostor
                              ? 'bg-red-950 border border-red-500 text-white'
                              : 'bg-cyan-950 border border-crew-cyan text-white'
                            : 'bg-gray-900 border border-gray-800 text-gray-200'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Pop-up Input */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-gray-800">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type squad message..."
                className="flex-1 bg-black border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-crew-cyan"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isSending || !inputValue.trim()}
                className={`px-3 py-2 rounded-xl text-xs font-display font-bold ${
                  isImpostor ? 'bg-red-600 text-white' : 'bg-crew-cyan text-black'
                }`}
              >
                ↵
              </button>
            </div>
          </div>
        )}

        {/* Floating Bubble Launcher */}
        <button
          type="button"
          onClick={() => {
            setIsFloatingOpen(!isFloatingOpen);
            setUnreadCount(0);
          }}
          className={`au-btn p-3.5 sm:p-4 rounded-full flex items-center gap-2.5 shadow-2xl transition-all hover:scale-105 active:scale-95 border-2 ${
            isImpostor
              ? 'bg-red-600 hover:bg-red-500 text-white border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.5)]'
              : 'bg-crew-cyan hover:bg-cyan-300 text-black border-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
          }`}
          title="Open Squad Encrypted Chat Pop-up"
        >
          <span className="text-xl">💬</span>
          <span className="font-display text-xs hidden sm:inline font-bold">
            {isFloatingOpen ? 'CLOSE CHAT' : 'SQUAD CHAT'}
          </span>
          {unreadCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-mono font-bold flex items-center justify-center animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
