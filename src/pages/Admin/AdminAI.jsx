import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FiZap, FiMessageCircle, FiSend, FiLoader, FiFileText, FiSquare } from "react-icons/fi"; // Add FiSquare for stop button
import { getGeminiAIResponse } from "../../services/geminiService";
import jsPDF from "jspdf";

const containerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.18, duration: 0.8, ease: "easeOut" } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 80, damping: 12 } }
};

const gradientVariants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.5, 0.7, 0.5],
    transition: { repeat: Infinity, duration: 6, ease: "easeInOut" }
  }
};

const CHAT_BOX_HEIGHT = "min-h-[600px] max-h-[700px] h-[70vh]"; // Adjust as needed

const examplePrompts = [
  "Suggest 5 innovative project ideas for engineering students.",
  "Write a description for a college tech fest.",
  "Generate a catchy title for a seminar on AI in education.",
  "Summarize the importance of teamwork in student projects."
];

// Utility to format AI output: supports line breaks, lists, and basic markdown-like formatting
function formatAIText(text) {
  // Convert markdown-like lists to HTML lists
  if (!text) return null;
  // Convert numbered lists
  text = text.replace(/(^|\n)(\d+)\. (.*?)(?=\n\d+\. |\n*$)/gs, (match) => {
    const items = match
      .trim()
      .split('\n')
      .map(line => line.replace(/^\d+\.\s/, '').trim())
      .filter(Boolean);
    if (items.length > 1) {
      return `<ol class="list-decimal ml-5 my-2">${items.map(i => `<li>${i}</li>`).join('')}</ol>`;
    }
    return match;
  });
  // Convert bullet lists
  text = text.replace(/(^|\n)[*-] (.*?)(?=\n[*-] |\n*$)/gs, (match) => {
    const items = match
      .trim()
      .split('\n')
      .map(line => line.replace(/^[-*]\s/, '').trim())
      .filter(Boolean);
    if (items.length > 1) {
      return `<ul class="list-disc ml-5 my-2">${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
    }
    return match;
  });
  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  // Italic
  text = text.replace(/\*(.*?)\*/g, '<i>$1</i>');
  // Line breaks
  text = text.replace(/\n/g, "<br/>");
  return text;
}

const AdminAI = () => {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I'm your AI assistant. Ask me for ideas, descriptions, or anything creative!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stopRequested, setStopRequested] = useState(false);
  const [typingMsg, setTypingMsg] = useState("");
  const inputRef = useRef(null);
  const typingTimeout = useRef(null);

  // PDF generation for the latest AI message
  const handleDownloadPDF = () => {
    // Find the last AI message
    const lastAI = [...messages].reverse().find(m => m.role === "ai");
    if (!lastAI) return;
    const doc = new jsPDF();

    // Convert HTML to plain text with line breaks and bullets
    let plainText = lastAI.text
      // Ordered lists: replace <ol>...</ol> with numbered lines
      .replace(/<ol.*?>([\s\S]*?)<\/ol>/g, (_, list) =>
        list
          .replace(/<li>(.*?)<\/li>/g, (__, item, idx, arr) => {
            // Find the index of this <li> in the list
            const items = list.match(/<li>(.*?)<\/li>/g) || [];
            const number = items.indexOf(__) + 1;
            return `${number}. ${item}\n`;
          })
      )
      // Unordered lists: replace <ul>...</ul> with bullet lines
      .replace(/<ul.*?>([\s\S]*?)<\/ul>/g, (_, list) =>
        list.replace(/<li>(.*?)<\/li>/g, "• $1\n")
      )
      // Bold/italic: remove tags, keep text
      .replace(/<b>(.*?)<\/b>/g, "$1")
      .replace(/<i>(.*?)<\/i>/g, "$1")
      // <br> to newline
      .replace(/<br\s*\/?>/gi, "\n")
      // Remove any other HTML tags
      .replace(/<[^>]+>/g, "")
      // Replace multiple newlines with a single newline
      .replace(/\n{2,}/g, "\n")
      .trim();

    // Split text to fit page width
    const lines = doc.splitTextToSize(plainText, 180);
    doc.text(lines, 10, 10);
    doc.save("ai-response.pdf");
  };

  // Typing animation utility
  const typeText = (fullText, onUpdate, onDone) => {
    let i = 0;
    setTypingMsg("");
    function typeNext() {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      if (stopRequested) {
        setTypingMsg("");
        setStopRequested(false);
        setLoading(false);
        if (onDone) onDone(true); // stopped
        return;
      }
      if (i <= fullText.length) {
        setTypingMsg(fullText.slice(0, i));
        onUpdate && onUpdate(fullText.slice(0, i));
        i++;
        typingTimeout.current = setTimeout(typeNext, 18);
      } else {
        setTypingMsg("");
        if (onDone) onDone(false); // finished
      }
    }
    typeNext();
  };

  const handleSend = async (promptText) => {
    const userText = promptText || input.trim();
    if (!userText) return;
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setLoading(true);
    setStopRequested(false);
    try {
      const aiText = await getGeminiAIResponse(userText);
      await new Promise((resolve) => {
        typeText(
          aiText,
          (typed) => setTypingMsg(typed),
          (wasStopped) => {
            if (!wasStopped) {
              setMessages((prev) => [...prev, { role: "ai", text: aiText }]);
            }
            setTypingMsg("");
            setLoading(false);
            resolve();
          }
        );
      });
    } catch (err) {
      setMessages((prev) => [...prev, { role: "ai", text: "Sorry, I couldn't process your request." }]);
      setTypingMsg("");
      setLoading(false);
    }
    inputRef.current?.focus();
  };

  return (
    <motion.div
      className="relative min-h-screen flex flex-col items-center justify-center bg-[#10101a] py-10 overflow-hidden" // <-- solid dark background
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Floating animated gradients */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-purple-700 via-blue-900 to-transparent opacity-40 blur-3xl pointer-events-none"
        variants={gradientVariants}
        animate="animate"
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-pink-800 via-fuchsia-900 to-transparent opacity-40 blur-3xl pointer-events-none"
        variants={gradientVariants}
        animate="animate"
      />

      {/* Header */}
      <motion.div className="w-full max-w-3xl mb-8 px-6" variants={itemVariants}>
        <motion.div
          className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-10 flex flex-col items-center glassmorphism relative overflow-hidden"
          initial={{ opacity: 0, y: -30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, type: "spring" }}
        >
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            style={{
              background: "radial-gradient(ellipse at 60% 40%, #a5b4fc 0%, transparent 70%)"
            }}
          />
          <div className="flex items-center gap-3 mb-2 z-10">
            <motion.span
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: [0, 10, -10, 0], scale: [0.8, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <FiZap className="text-primary-300 text-4xl drop-shadow-lg" />
            </motion.span>
            <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">
              Admin AI Assistant
            </h1>
          </div>
          <motion.p
            className="text-lg text-gray-200 text-center mb-2 z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="bg-gradient-to-r from-primary-300 via-accent-400 to-purple-400 bg-clip-text text-transparent font-semibold">
              Generate creative ideas, descriptions, and more with AI.
            </span>
          </motion.p>
          <motion.p
            className="text-sm text-primary-200 text-center z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Powered by <span className="font-bold text-primary-300">Gemini</span>
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Fixed Chat Box */}
      <motion.div className="w-full max-w-3xl flex-1" variants={itemVariants}>
        <motion.div
          className={`backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-0 glassmorphism flex flex-col relative overflow-hidden ${CHAT_BOX_HEIGHT}`}
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, type: "spring", delay: 0.2 }}
        >
          {/* Chat Header */}
          <div className="flex items-center gap-2 px-8 pt-8 pb-4 z-10">
            <FiMessageCircle className="text-accent-300 text-2xl" />
            <span className="text-xl font-semibold text-white">Chat with AI</span>
            {/* PDF Button */}
            <button
              className="ml-auto flex items-center gap-1 px-3 py-1 rounded-full bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium transition-all duration-200"
              onClick={handleDownloadPDF}
              type="button"
              title="Download last AI response as PDF"
            >
              <FiFileText size={16} />
              PDF
            </button>
          </div>
          {/* Example prompts */}
          <div className="flex flex-wrap gap-2 px-8 pb-4 z-10">
            {examplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                className="px-3 py-1 rounded-full bg-white/20 text-primary-200 hover:bg-primary-400/20 hover:text-white transition-all duration-200 text-xs font-medium border border-white/10"
                onClick={() => handleSend(prompt)}
                disabled={loading}
              >
                {prompt}
              </button>
            ))}
          </div>
          {/* Chat messages area */}
          <div className="flex-1 overflow-y-auto px-8 pb-4 z-10 custom-scrollbar">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-md text-sm ${
                    msg.role === "user"
                      ? "bg-primary-500 text-white rounded-br-none"
                      : "bg-white/20 text-white rounded-bl-none border border-white/10"
                  }`}
                  style={msg.role === "ai" ? { fontFamily: "Inter, sans-serif", fontSize: "1rem" } : {}}
                >
                  {msg.role === "ai" ? (
                    <span
                      className="prose prose-invert prose-sm"
                      dangerouslySetInnerHTML={{ __html: formatAIText(msg.text) }}
                    />
                  ) : (
                    msg.text
                  )}
                </div>
              </motion.div>
            ))}
            {/* Typing animation for AI */}
            {typingMsg && (
              <div className="mb-3 flex justify-start">
                <div className="max-w-[80%] px-4 py-2 rounded-2xl shadow-md text-sm bg-white/20 text-white rounded-bl-none border border-white/10 font-mono flex items-center gap-2">
                  <span>
                    <span
                      dangerouslySetInnerHTML={{ __html: formatAIText(typingMsg) }}
                    />
                  </span>
                  <span className="animate-pulse">|</span>
                </div>
              </div>
            )}
            {loading && !typingMsg && (
              <div className="flex justify-start mb-3">
                <div className="px-4 py-2 rounded-2xl bg-white/20 text-white flex items-center gap-2 border border-white/10">
                  <FiLoader className="animate-spin" /> AI is typing...
                </div>
              </div>
            )}
          </div>
          {/* Input area fixed at bottom */}
          <form
            className="flex gap-2 px-8 pb-8 pt-2 z-10 bg-transparent"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
            onSubmit={e => {
              e.preventDefault();
              if (!loading) handleSend();
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="flex-1 rounded-full px-4 py-2 bg-white/20 text-white placeholder:text-primary-200 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all"
              placeholder="Type your prompt..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              autoFocus
            />
            {/* Toggle between Send and Stop button */}
            {!loading ? (
              <button
                type="submit"
                className="rounded-full bg-primary-500 hover:bg-primary-600 text-white p-2 transition-all flex items-center justify-center disabled:opacity-60"
                disabled={!input.trim()}
                aria-label="Send"
              >
                <FiSend size={28} />
              </button>
            ) : (
              <button
                type="button"
                className="rounded-full bg-red-500 hover:bg-red-600 text-white p-2 transition-all flex items-center justify-center"
                onClick={() => {
                  setStopRequested(true);
                  setLoading(false);
                  if (typingTimeout.current) clearTimeout(typingTimeout.current);
                }}
                aria-label="Stop"
              >
                <FiSquare size={28} />
              </button>
            )}
          </form>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AdminAI;