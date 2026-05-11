import { FaMusic, FaPlay, FaPause, FaForward, FaBackward, FaExternalLinkAlt } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';
import profile from '../data/profile';

export default function MusicPlayer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  // 使用本地音乐文件或默认测试音频
  // 这里我们使用B站链接作为跳转，音频使用通知音效
  const songs = profile.songs;

  const playAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % songs.length);
    setIsPlaying(false);
    setProgress(0);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + songs.length) % songs.length);
    setIsPlaying(false);
    setProgress(0);
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100 || 0;
      setProgress(pct);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const onEnded = () => {
    next();
  };

  const formatTime = (t) => {
    if (!t || isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const song = songs[currentIndex];

  return (
    <div className="music-player">
      <h3><FaMusic /> 音乐盒子</h3>
      <div className="music-info">
        <div className="music-title">{song.title}</div>
        <div className="music-artist">{song.artist}</div>
      </div>
      <div className="music-controls">
        <button onClick={prev} title="上一首"><FaBackward /></button>
        <button className="play-btn" onClick={playAudio} title={isPlaying ? '暂停' : '播放'}>
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <button onClick={next} title="下一首"><FaForward /></button>
      </div>
      <div className="music-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="music-song-list">
        <p className="song-list-label">喜欢的歌曲列表：</p>
        {songs.map((s, i) => (
          <div
            key={i}
            className={`song-row ${i === currentIndex ? 'active' : ''}`}
            onClick={() => { setCurrentIndex(i); setIsPlaying(false); setProgress(0); }}
          >
            <span className="song-idx">{String(i + 1).padStart(2, '0')}</span>
            <span className="song-name">{s.title}</span>
            <span className="song-artist-name">- {s.artist}</span>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="song-link" onClick={e => e.stopPropagation()}>
              <FaExternalLinkAlt />
            </a>
          </div>
        ))}
      </div>
      {/* 隐藏音频元素 - 由于版权原因，播放器仅作为UI展示 */}
      <audio
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        onLoadedMetadata={onTimeUpdate}
      />
    </div>
  );
}
