import { useState, useRef, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from '../../services/firebase';
import { FiSend, FiUsers, FiSmile, FiImage } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import {uploadToImgbb} from '../../services/imgbb'

const Chat = ({ type = 'community' }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [image, setImage] = useState(null);
  const messagesEndRef = useRef(null);

  // Listen for messages in realtime
  useEffect(() => {
    setLoading(true);
    setError('');
    // Only one community: 'student-student'
    const chatType = 'student-student';
    const q = query(
      collection(db, "communityChats", chatType, "messages"),
      orderBy("timestamp")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      setError("Failed to load messages.");
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !image) return;
    const chatType = 'student-student';
    let imageUrl = null;

    // Handle image upload if image is selected
    if (image) {
      imageUrl = await uploadToImgbb(image);
    }

    try {
      await addDoc(collection(db, "communityChats", chatType, "messages"), {
        content: newMessage,
        imageUrl: imageUrl || null,
        sender: user?.id || 'student',
        senderName: user?.name || 'Student',
        senderRole: user?.role || 'student',
        timestamp: Timestamp.now(),
      });
      setNewMessage('');
      setImage(null);
      setShowEmoji(false);
    } catch {
      setError("Failed to send message.");
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    if (typeof timestamp.toDate === "function") {
      return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render message bubbles
  const renderMessage = (message) => {
    const isCurrentUser = message.sender === user.id;

    return (
      <div
        key={message.id}
        className={`flex w-full mb-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`
            flex flex-col max-w-[70%]
            ${isCurrentUser ? 'self-end items-end' : 'self-start items-start'}
          `}
        >
          <div
            className={`
              px-4 py-2 rounded-2xl shadow
              ${isCurrentUser
                ? 'bg-green-500 text-white rounded-br-md ml-8'
                : 'bg-white text-gray-900 rounded-bl-md border border-gray-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 mr-8'
              }
              relative
            `}
            style={{
              borderBottomRightRadius: isCurrentUser ? '0.5rem' : '1rem',
              borderBottomLeftRadius: !isCurrentUser ? '0.5rem' : '1rem',
              wordBreak: 'break-word',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              {!isCurrentUser && (
                <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                  {message.senderName}
                </span>
              )}
              <span className="text-[10px] text-gray-400 ml-1">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
            <div className="text-base font-medium leading-relaxed break-words">
              {message.content}
            </div>
            {message.imageUrl && (
              <img
                src={message.imageUrl}
                alt="shared"
                className="mt-2 max-w-xs max-h-60 rounded-lg border"
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  // Emoji select handler
  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji.native);
  };

  return (
    <div className="flex h-full flex-col rounded-xl bg-gray-100 shadow-sm dark:bg-gray-800">
      {/* Header */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-1 items-center justify-center gap-2 p-3 text-lg font-bold border-b-2 border-green-500 text-green-700 dark:text-green-300">
          <FiUsers />
          Community Chat
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex h-full items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-green-500"></div>
          </div>
        )}

        {error && (
          <div className="m-4 rounded-lg bg-red-100 p-3 text-center text-red-800 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 rounded-full bg-gray-200 p-3 dark:bg-gray-700">
              <FiUsers className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">
              No messages yet
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Be the first to start the conversation!
            </p>
          </div>
        )}

        {!loading && messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="border-t border-gray-200 p-3 dark:border-gray-700 bg-white dark:bg-gray-900 relative">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setShowEmoji(!showEmoji)}
            tabIndex={-1}
          >
            <FiSmile size={22} />
          </button>
          {showEmoji && (
            <div className="absolute bottom-16 left-2 z-50">
              <Picker data={data} onEmojiSelect={addEmoji} theme="light" />
            </div>
          )}
          <label className="cursor-pointer rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700">
            <FiImage size={22} />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => setImage(e.target.files[0])}
            />
          </label>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 rounded-full px-4 py-2 bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all shadow text-gray-900"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            disabled={!newMessage.trim() && !image}
            className="rounded-full bg-green-500 hover:bg-green-600 text-white p-3 transition-all flex items-center justify-center shadow disabled:opacity-60"
            aria-label="Send"
          >
            <FiSend size={20} />
          </button>
        </form>
        {image && (
          <div className="mt-2 flex items-center gap-2">
            <img src={URL.createObjectURL(image)} alt="preview" className="w-16 h-16 object-cover rounded" />
            <button
              className="text-xs text-red-500 underline"
              onClick={() => setImage(null)}
              type="button"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;