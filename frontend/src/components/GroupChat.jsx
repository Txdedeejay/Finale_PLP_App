import React, { useState, useEffect, useRef } from "react";
import api from "../api";

export default function GroupChat({ user, groupId, isModal = false }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  // Load messages from backend or use mock data
  useEffect(() => {
    const loadMessages = async () => {
      try {
        if (groupId) {
          const response = await api.get(`/chat/${groupId}`);
          setMessages(response.data || []);
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
        // Use mock data as fallback
        setMessages([
          { id: 1, user: 'Community Manager', text: 'Welcome to the project chat! 🎉', timestamp: new Date(Date.now() - 3600000), isOwn: false },
          { id: 2, user: user?.name || 'You', text: 'Looking forward to collaborating.', timestamp: new Date(Date.now() - 1800000), isOwn: true },
          { id: 3, user: 'Community Manager', text: 'Great! Let\'s get started.', timestamp: new Date(Date.now() - 900000), isOwn: false },
        ]);
      }
    };

    setIsConnected(true);
    loadMessages();
  }, [groupId, user?.name]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const message = { 
      id: Date.now(), 
      user: user?.name || 'Anonymous', 
      text: newMessage, 
      timestamp: new Date(), 
      isOwn: true 
    };
    
    // Add to UI immediately for responsiveness
    setMessages(prev => [...prev, message]);
    setNewMessage("");

    // Send to backend
    try {
      if (groupId) {
        await api.post(`/chat/${groupId}`, {
          text: newMessage,
          sender: user?.id || 'anonymous',
        });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      // Message still appears in UI even if backend fails
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (ts) => ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={`bg-white rounded-xl p-6 flex flex-col shadow-md border border-gray-200 ${isModal ? 'h-full' : 'h-[550px]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <div>
          <h3 className="text-lg font-bold text-gray-800">💬 Team Collaboration Chat</h3>
          <p className="text-xs text-gray-600 mt-1">Real-time messaging for project teams</p>
        </div>
        <div className={`text-xs font-semibold px-3 py-1 rounded-full ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 bg-gray-50 rounded-lg mb-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-lg p-3 ${
              msg.isOwn 
                ? 'bg-blue-500 text-white rounded-br-none' 
                : 'bg-white text-gray-800 border border-gray-300 rounded-bl-none'
            }`}>
              {!msg.isOwn && (
                <div className="text-xs font-bold mb-1 text-gray-600">
                  {msg.user}
                </div>
              )}
              <div className="text-sm break-words">{msg.text}</div>
              <div className={`text-[11px] mt-1 ${msg.isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                {formatTime(msg.timestamp)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex gap-2 items-end">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message... (Enter to send)"
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <button 
          onClick={handleSendMessage} 
          className="px-5 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold text-sm whitespace-nowrap"
          title="Send message (Ctrl+Enter)"
        >
          📤 Send
        </button>
      </div>
    </div>
  );
}
