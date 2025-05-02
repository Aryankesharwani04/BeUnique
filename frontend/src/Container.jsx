import React, { useEffect, useState, useRef } from 'react';
import {
  FaGithub,
  FaLinkedin,
  FaCode,
  FaHackerrank,
  FaTwitter,
  FaDev,
  FaMedium,
  FaNpm,
  FaDocker,
  FaBitbucket,
  FaKaggle,
  FaGamepad
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Container.css';

export default function Container() {
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [checked, setChecked] = useState(false);
  const inputRef = useRef(null);

  // Include LinkedIn at top; its status will be set only after check
  const platforms = [
    { key: 'linkedin', label: 'LinkedIn', icon: <FaLinkedin />, url: (u) => `https://www.linkedin.com/in/${u}` },
    { key: 'github', label: 'GitHub', icon: <FaGithub />, url: (u) => `https://github.com/${u}` },
    { key: 'leetcode', label: 'LeetCode', icon: <FaCode />, url: (u) => `https://leetcode.com/u/${u}` },
    { key: 'hackerrank', label: 'HackerRank', icon: <FaHackerrank />, url: (u) => `https://www.hackerrank.com/profile/${u}` },
    { key: 'twitter', label: 'Twitter', icon: <FaTwitter />, url: (u) => `https://twitter.com/${u}` },
    { key: 'devto', label: 'Dev.to', icon: <FaDev />, url: (u) => `https://dev.to/${u}` },
    { key: 'medium', label: 'Medium', icon: <FaMedium />, url: (u) => `https://medium.com/@${u}` },
    { key: 'npm', label: 'NPM', icon: <FaNpm />, url: (u) => `https://www.npmjs.com/~${u}` },
    { key: 'dockerhub', label: 'Docker Hub', icon: <FaDocker />, url: (u) => `https://hub.docker.com/u/${u}` },
    { key: 'bitbucket', label: 'Bitbucket', icon: <FaBitbucket />, url: (u) => `https://bitbucket.org/${u}/` },
    { key: 'kaggle', label: 'Kaggle', icon: <FaKaggle />, url: (u) => `https://www.kaggle.com/${u}` },
    { key: 'codeforces', label: 'Codeforces', icon: <FaGamepad />, url: (u) => `https://codeforces.com/profile/${u}` }
  ];

  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) setDarkMode(stored === 'true');
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    darkMode ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function checkUsername(e) {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setLoading(true);
    setChecked(true);
    setAvailability({});

    try {
      const res = await fetch('https://beunique.onrender.com/checkUsername', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: inputValue.trim() })
      });
      const data = await res.json();
      setAvailability({ linkedin: 'error', ...data });

      platforms.forEach(({ key, label }) => {
        if (data[key]) toast.success(`${label} is available!`, { position: 'top-right', autoClose: 3000 });
      });
    } catch (err) {
      console.error(err);
      const errState = { linkedin: 'error' };
      platforms.slice(1).forEach(({ key }) => { errState[key] = false; });
      setAvailability(errState);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row transition-colors container relative">
      <ToastContainer />
      <aside className="w-full md:w-1/3 p-8 flex flex-col sidebar">
        <h1 className="text-4xl font-extrabold mb-4 text-[var(--text-100)]">
          Be<span className="text-[var(--accent-100)]">Unique</span>
        </h1>
        <p className="mb-6 text-lg text-[var(--text-200)]">
          Tired of picking usernames everywhere? Find a unique handle across platforms.
        </p>
        <button
          onClick={() => setDarkMode((prev) => !prev)}
          className="mt-auto p-3 rounded-full shadow transition-transform duration-500 mode-toggle w-12 h-12 flex items-center justify-center"
          aria-label="Toggle dark mode"
          style={{ fontSize: '1.5rem', transform: darkMode ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.4s ease-in-out', background: 'var(--bg-300)' }}
        >
          {darkMode ? '🌙' : '🌞'}
        </button>
      </aside>

      <main className="w-full md:w-2/3 p-8 flex flex-col items-center justify-center space-y-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-200)' }}>
          Your Ideal Username
        </h2>
        <form onSubmit={checkUsername} className="w-full max-w-full md:max-w-md flex flex-col space-y-4">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter username..."
            aria-label="Username input"
            className="w-full p-3 rounded-lg focus:outline-none focus:ring-2 input"
            style={{ borderColor: 'var(--primary-200)', background: 'var(--bg-200)', color: 'var(--text-200)' }}
            disabled={loading}
          />
          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg font-semibold transition-opacity btn-primary" style={{ background: 'var(--primary-200)', color: 'var(--text-100)' }} aria-label="Check username availability">
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 rounded-full animate-spin border-2 border-[var(--bg-100)] border-t-[var(--primary-100)]" />
                <span>Checking...</span>
              </div>
            ) : (
              'Check'
            )}
          </button>
        </form>

        <section className="mt-6 w-full max-w-full md:max-w-md">
          <h3 className="text-xl font-medium mb-4" style={{ color: 'var(--text-200)' }}>
            Availability
          </h3>
          <ul className="space-y-3">
            {platforms.map(({ key, label, icon, url }) => {
              const status = availability[key];
              const showLinkedinError = key === 'linkedin' && checked;
              return (
                <li key={key} className={`flex justify-between items-center p-3 rounded-lg shadow-sm transform transition-all duration-300 hover:-translate-y-1 scale-95 platform-item ${status == null && !showLinkedinError ? 'opacity-50' : 'opacity-100 scale-100'}`} style={{ background: 'var(--bg-300)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
                  <div className="flex items-center gap-3 text-[var(--text-200)] text-lg">
                    {icon} <span>{label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Show Visit for LinkedIn only after check, and for others if taken */}
                    {((key === 'linkedin' && showLinkedinError) || status === false) && (
                      <a href={url(inputValue)} target="_blank" rel="noopener noreferrer" className="underline text-[var(--accent-100)] text-sm">
                        Visit
                      </a>
                    )}
                    <span className={`px-2 py-1 rounded-full text-sm font-semibold transition-all ${
                      showLinkedinError
                        ? 'bg-red-500 text-white'
                        : status == null
                        ? 'bg-yellow-400 text-black'
                        : status
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}>
                      {showLinkedinError ? 'Internal Server error' : status == null ? 'Checking' : status ? 'Available' : 'Taken'}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </div>
  );
}
