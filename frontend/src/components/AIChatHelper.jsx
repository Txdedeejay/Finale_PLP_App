import React, { useState } from "react";
import aiService from "../services/aiService";

export default function AIChatHelper({ user }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const aiResponse = await aiService.generateResponse(inputMessage, {
        userRole: user.role,
        ngoFocus: user.ngo?.focusAreas || [],
      });

      const responseText =
        typeof aiResponse === "object"
          ? aiResponse.message || JSON.stringify(aiResponse)
          : aiResponse;

      const aiMessage = {
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      const errorMessage = {
        role: "assistant",
        content: "⚠️ AI service unavailable. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2">🤖 AI Assistant</h2>
      <p className="text-slate-200 mb-4">Welcome, {user.name}</p>

      {/* Chat Display Area */}
      <div className="min-h-[300px] border border-gray-300 p-3 mb-4 overflow-y-auto rounded-lg bg-gray-50 shadow-inner">
        {messages.map((msg, i) => {
          const displayText =
            typeof msg.content === "object"
              ? msg.content.message || JSON.stringify(msg.content)
              : msg.content;

          return (
            <div
              key={i}
              className={`mb-3 flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <span
                className={`inline-block px-4 py-2 rounded-2xl max-w-[80%] break-words ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {displayText}
              </span>
            </div>
          );
        })}
      </div>

      {/* Input area */}
      <div className="flex gap-3">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading}
          className={`px-5 py-2 rounded-lg text-white transition ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
