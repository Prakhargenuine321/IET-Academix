import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FiSend, FiPaperclip } from "react-icons/fi";
import { getGeminiAIResponse } from "../../services/geminiService";
import ReactMarkdown from 'react-markdown';
import jsPDF from "jspdf";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

const TYPING_SPEED = 25; // ms per character

const ChatAI = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      content: "Hi! I'm your 🤖 AI Assistant. Ask me anything about this document.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingMsg, setTypingMsg] = useState(""); // The full AI message to animate
  const [displayedTyping, setDisplayedTyping] = useState(""); // The animated part
  const [pdfText, setPdfText] = useState("");
  const messagesEndRef = useRef(null);
  const typingIntervalRef = useRef(null);

  // Only scroll when a new message is added (not during typing)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Typing animation effect (does NOT update messages array)
  useEffect(() => {
    if (!loading || !typingMsg) return;
    let i = 0;
    setDisplayedTyping(""); // Reset before starting
    typingIntervalRef.current = setInterval(() => {
      i++;
      setDisplayedTyping(typingMsg.slice(0, i));
      if (i >= typingMsg.length) {
        clearInterval(typingIntervalRef.current);
        // Add the full AI message to messages array
        setMessages((msgs) => [
          ...msgs,
          {
            id: Date.now(),
            sender: "ai",
            content: typingMsg,
            timestamp: new Date().toISOString(),
          },
        ]);
        setTypingMsg("");
        setDisplayedTyping("");
        setLoading(false);
      }
    }, TYPING_SPEED);

    return () => clearInterval(typingIntervalRef.current);
    // eslint-disable-next-line
  }, [typingMsg]);

  // Stop generating handler
  const handleStop = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    // Instantly finish the message
    setDisplayedTyping(typingMsg);
    setMessages((msgs) => [
      ...msgs,
      {
        id: Date.now(),
        sender: "ai",
        content: typingMsg,
        timestamp: new Date().toISOString(),
      },
    ]);
    setTypingMsg("");
    setDisplayedTyping("");
    setLoading(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const question = input.trim();
    if (!question) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      content: question,
      timestamp: new Date().toISOString(),
    };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);

    // If PDF is loaded, include its text in the prompt
    let prompt = question;
    if (pdfText) {
      prompt = `Given the following PDF content:\n${pdfText}\n\nAnswer this question based only on the PDF content above:\n${question}`;
    }

    try {
      const aiContent = await getGeminiAIResponse(prompt);
      setTypingMsg(aiContent || "🤖 Sorry, I couldn't get a response from Gemini AI.");
    } catch (err) {
      setTypingMsg("🤖 Sorry, I couldn't get a response from Gemini AI.");
    }
  };

  const handleDownloadPDF = (content) => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    // Split by lines for basic formatting
    const lines = content.split('\n');
    doc.text(lines, 10, 20);
    doc.save("ai-response.pdf");
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function() {
      const typedarray = new Uint8Array(this.result);
      const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(" ") + "\n";
      }
      setPdfText(text);
    };
    reader.readAsArrayBuffer(file);
  };

  const renderMessage = (msg) => (
    <motion.div
      key={msg.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-4 flex ${msg.sender === "ai" ? "justify-start" : "justify-end"}`}
    >
      <div className={`max-w-[80%] flex items-end gap-2 ${msg.sender === "ai" ? "" : "flex-row-reverse"}`}>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-xl ${
            msg.sender === "ai" ? "bg-blue-500" : "bg-green-500"
          }`}
        >
          {msg.sender === "ai" ? "🤖" : "🧑"}
        </div>
        <div
          className={`relative rounded-xl px-4 py-2 text-sm shadow-sm ${
            msg.sender === "ai"
              ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
              : "bg-primary-500 text-white"
          }`}
        >
          <ReactMarkdown>{msg.content}</ReactMarkdown>
          {/* PDF button for AI messages at the end */}
          {msg.sender === "ai" && (
            <div className="flex justify-end mt-2">
              <button
                onClick={() => handleDownloadPDF(msg.content)}
                className="text-xs px-2 py-1 bg-gray-300 hover:bg-gray-400 rounded"
                title="Download as PDF"
              >
                📄 PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col rounded-xl bg-white shadow-sm dark:bg-gray-800 h-full min-h-[60vh] sm:min-h-[80vh] md:min-h-0 md:h-full mb-10"
  >
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-blue-500">🤖</span> AI Assistant
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Ask questions about this document
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {/* <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="mb-2" /> */}
        {pdfText && (
          <div className="mb-2 text-xs text-gray-500">
            PDF loaded. Your questions will be answered based on this PDF.
          </div>
        )}
        {messages.map(renderMessage)}
        {/* Typing animation message (not in messages array) */}
        {loading && typingMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex justify-start"
          >
            <div className="max-w-[80%] flex items-end gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full text-xl bg-blue-500">
                🤖
              </div>
              <div className="rounded-xl px-4 py-2 text-sm shadow-sm bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white">
                <ReactMarkdown>{displayedTyping || "..."}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-gray-200 p-3 dark:border-gray-700">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input flex-1"
            placeholder="Type your question..."
            disabled={loading}
          />
          {/* Attach PDF icon button */}
          <label className="cursor-pointer flex items-center">
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdfUpload}
              style={{ display: "none" }}
              disabled={loading}
            />
            <span
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Attach PDF"
            >
              <FiPaperclip size={20} />
            </span>
          </label>
          {loading ? (
            <button
              type="button"
              onClick={handleStop}
              className="btn bg-red-500 text-white hover:bg-red-600 transition"
            >
              Stop Generating
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="btn btn-primary"
            >
              <FiSend />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatAI;