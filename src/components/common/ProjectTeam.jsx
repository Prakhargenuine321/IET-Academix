import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiLinkedin } from "react-icons/fi"; // Add this import
import Navbar from "../../components/common/Navbar2";
import Footer from "../../components/common/Footer";

gsap.registerPlugin(ScrollTrigger);

const teamMembers = [
  {
    name: "Prakhar Patel",
    role: "AI & Frontend Development",
    img: "https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg?cs=srgb&dl=pexels-anjana-c-169994-674010.jpg&fm=jpg",
    bio: "Passionate about building scalable web apps with creative UI experiences",
    linkedin: "https://www.linkedin.com/in/prakhar-patel-450242248/",
  },
  {
    name: "Priyanshu Yadav",
    role: "Backend Developer & AI",
    img: "https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg?cs=srgb&dl=pexels-anjana-c-169994-674010.jpg&fm=jpg",
    bio: "Passionate about Backend development & its secured environment",
    linkedin: "https://www.linkedin.com/in/priyanshu-yadav-90b60a25b/",
  },
  {
    name: "Akash Sahu",
    role: "Backend Developer & API",
    img: "https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg?cs=srgb&dl=pexels-anjana-c-169994-674010.jpg&fm=jpg",
    bio: "Loves APIs, databases, and clean code that is my routine",
    linkedin: "https://www.linkedin.com/in/priyanshu-yadav-90b60a25b/",
  },
  {
    name: "Bhavna Rajput",
    role: "UI/UX Designer",
    img: "https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg?cs=srgb&dl=pexels-anjana-c-169994-674010.jpg&fm=jpg",
    bio: "Loves to work on UI/UX and Java Expertise thats my life",
    linkedin: "https://www.linkedin.com/in/priyanshu-yadav-90b60a25b/",
  },
];

const ProjectTeam = () => {
  const cardsRef = useRef([]);
  const [showCursor, setShowCursor] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // Track mouse position
  useEffect(() => {
    const move = (e) => setCursorPos({ x: e.clientX, y: e.clientY });
    if (showCursor) window.addEventListener("mousemove", move);
    else setCursorPos({ x: -100, y: -100 }); // Hide off-screen when not active
    return () => window.removeEventListener("mousemove", move);
  }, [showCursor]);


//Team member card animation using GSAP.
  useEffect(() => {
    gsap.fromTo(
      cardsRef.current,
      { opacity: 0, y: 80, scale: 0.83 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.2,
        ease: "power3.out",
        stagger: 0.2,
        scrollTrigger: {
          trigger: ".team-section",
          start: "top 80%",
        },
      }
    );
  }, []);

  // Enable smooth scroll on mount
  useEffect(() => {
    const originalScroll = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = originalScroll;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0e1014] text-white relative overflow-x-hidden">
      <Navbar />
      {/* Custom LinkedIn Cursor */}
      <div
        style={{
          left: cursorPos.x - 32,
          top: cursorPos.y - 32,
          opacity: showCursor ? 1 : 0,
          pointerEvents: "none",
        }}
        className="fixed z-[9999] w-32 h-16 rounded-full bg-green-500 flex items-center justify-center transition-opacity duration-200"
      >
        <span className="text-white font-semibold text-base select-none">Let's Connect</span>
      </div>
      <section className="team-section pt-32 pb-20 px-4 max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-8 tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-purple-500">
            Meet Our Team
          </span>
        </h1>
        <p className="text-center text-lg text-gray-300 mb-16 max-w-2xl mx-auto">
          We are a group of passionate developers, designers, and innovators dedicated to building the best educational platform.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 md:grid-cols-2">
          {teamMembers.map((member, idx) => (
            <div
              key={member.name}
              ref={el => (cardsRef.current[idx] = el)}
              className="relative group bg-gradient-to-br from-[#181c23] to-[#23272f] rounded-3xl shadow-2xl p-8 flex flex-col items-center border border-white/10 overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_32px_0_rgba(34,197,94,0.3)]"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-green-400/30 to-blue-400/10 rounded-full blur-2xl opacity-60 group-hover:scale-110 transition-transform"></div>
              <div className="relative mb-6">
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-28 h-28 rounded-full border-4 border-white/10 shadow-lg object-cover"
                />
                <div className="absolute inset-0 rounded-full border-2 border-gradient-to-tr from-green-400 via-blue-400 to-purple-500 animate-spin-slow pointer-events-none" />
              </div>
              <h2 className="text-2xl font-bold mb-1">{member.name}</h2>
              <h3 className="text-lg font-semibold text-green-400 mb-2 text-center">{member.role}</h3>
              <p className="text-gray-300 text-center mb-4">{member.bio}</p>
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-auto text-blue-400 hover:text-green-400 transition-colors relative z-10"
                onMouseEnter={() => setShowCursor(true)}
                onMouseLeave={() => setShowCursor(false)}
              >
                LinkedIn &rarr;
              </a>
            </div>
          ))}
        </div>
      </section>
      <Footer />
      <style>
        {`
          @media (min-width: 640px) {
            .team-section .grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }
          .animate-spin-slow {
            animation: spin 6s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default ProjectTeam;