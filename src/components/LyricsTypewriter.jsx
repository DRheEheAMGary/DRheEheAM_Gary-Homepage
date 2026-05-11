import { useState, useEffect, useCallback } from 'react';
import profile from '../data/profile';

export default function LyricsTypewriter() {
  const [displayText, setDisplayText] = useState('');
  const [phase, setPhase] = useState('typing'); // typing | waiting | deleting
  const [lyricIndex, setLyricIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  const getRandomLyric = useCallback(() => {
    return profile.lyrics[Math.floor(Math.random() * profile.lyrics.length)];
  }, []);

  const [currentLyric, setCurrentLyric] = useState(getRandomLyric);

  useEffect(() => {
    const shortLimit = 20;
    const isShort = currentLyric.length <= shortLimit;
    const typeSpeed = isShort ? 60 : 80;
    const deleteSpeed = isShort ? 35 : 45;
    const waitTime = isShort ? 2000 : 3000;

    let timer;

    if (phase === 'typing') {
      if (charIndex < currentLyric.length) {
        timer = setTimeout(() => {
          setDisplayText(prev => prev + currentLyric[charIndex]);
          setCharIndex(prev => prev + 1);
        }, typeSpeed);
      } else {
        timer = setTimeout(() => setPhase('waiting'), waitTime);
      }
    } else if (phase === 'waiting') {
      timer = setTimeout(() => setPhase('deleting'), 0);
    } else if (phase === 'deleting') {
      if (charIndex > 0) {
        timer = setTimeout(() => {
          setDisplayText(prev => prev.slice(0, -1));
          setCharIndex(prev => prev - 1);
        }, deleteSpeed);
      } else {
        const next = getRandomLyric();
        setCurrentLyric(next);
        setPhase('typing');
      }
    }

    return () => clearTimeout(timer);
  }, [phase, charIndex, currentLyric, getRandomLyric]);

  return (
    <div className="lyrics-typewriter">
      <span className="lyrics-text">{displayText}</span>
      <span className="lyrics-cursor">|</span>
    </div>
  );
}
