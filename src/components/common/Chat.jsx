import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiUsers, FiUser } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../context/ChatContext';

const Chat = ({ type = 'community' }) => {
  const { user } = useAuth();
  const { messages, loading, error, activeTab, sendMessage, switchTab } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    // Build the message object
    const messageObj = {
      content: newMessage,
      sender: user?.id || 'student', // fallback if user is not defined
      senderName: user?.name || 'Student',
      senderRole: user?.role || 'student',
      chatType: type,
      timestamp: new Date().toISOString(),
    };

    const result = await sendMessage(messageObj);

    if (result.success) {
      setNewMessage('');
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Render message bubbles
  const renderMessage = (message) => {
    let isCurrentUser = false;
    let isAI = false;
  
    if (type === 'ai') {
      isAI = message.sender === 'ai';
      isCurrentUser = message.sender === user.id;
    } else {
      isCurrentUser = message.sender === user.id;
    }
  
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-4 flex ${
          type === 'ai'
            ? isAI
              ? 'justify-start'
              : 'justify-end'
            : isCurrentUser
              ? 'justify-end'
              : 'justify-start'
        }`}
      >
        <div className={`max-w-[80%] ${type === 'ai' ? (isAI ? 'order-1' : 'order-2') : (isCurrentUser ? 'order-1' : 'order-2')}`}>
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${
              isAI
                ? 'bg-accent-500'
                : message.senderRole === 'student'
                  ? 'bg-primary-500'
                  : message.senderRole === 'teacher'
                    ? 'bg-secondary-500'
                    : 'bg-accent-500'
            }`}>
              {isAI ? '🤖' : message.senderName?.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {isAI ? 'AI Assistant' : message.senderName}
                <span className="ml-1 text-xs font-normal text-gray-500 dark:text-gray-400">
                  • {formatTimestamp(message.timestamp)}
                </span>
              </p>
            </div>
          </div>
          <div className={`mt-1 rounded-xl px-4 py-2 text-sm shadow-sm ${
            (type === 'ai' && isAI) || (!type === 'ai' && !isCurrentUser)
              ? 'bg-white text-gray-800 dark:bg-gray-700 dark:text-white'
              : 'bg-primary-500 text-white'
          }`}>
            {message.content}
          </div>
        </div>
      </motion.div>
    );
  };
  
  return (
    <div className="flex h-full flex-col rounded-xl bg-white shadow-sm dark:bg-gray-800">
      {/* Header with tabs for community chat */}
      {type === 'community' && (
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => switchTab('student-student')}
            className={`flex flex-1 items-center justify-center gap-2 p-3 text-sm font-medium ${
              activeTab === 'student-student'
                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <FiUsers />
            Student - Student
          </button>
          <button
            onClick={() => switchTab('student-teacher')}
            className={`flex flex-1 items-center justify-center gap-2 p-3 text-sm font-medium ${
              activeTab === 'student-teacher'
                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <FiUser />
            Student - Teacher
          </button>
        </div>
      )}
      
      {/* Chat header for AI chat */}
      {type === 'ai' && (
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ask questions about this document
          </p>
        </div>
      )}
      
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* if there is loading, show a loading spinner */}
        {loading && (
          <div className="flex h-full items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary-500"></div>
          </div>
        )}
        
        {error && (
          <div className="m-4 rounded-lg bg-error-100 p-3 text-center text-error-800 dark:bg-error-900/30 dark:text-error-300">
            {error}
          </div>
        )}
        
        {!loading && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 rounded-full bg-gray-100 p-3 dark:bg-gray-700">
              <FiUsers className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">
              No messages yet
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {type === 'community' 
                ? 'Be the first to start the conversation!'
                : 'Ask a question to get started'
              }
            </p>
          </div>
        )}
        
        {!loading && messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="border-t border-gray-200 p-3 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="input"
            placeholder="Type your message..."
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="btn btn-primary"
          >
            <FiSend />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;