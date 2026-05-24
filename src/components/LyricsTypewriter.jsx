import { useReducer, useEffect, useCallback } from 'react';
import profile from '../data/profile';

export default function LyricsTypewriter() {
  const getRandomLyric = useCallback(() => {
    return profile.lyrics[Math.floor(Math.random() * profile.lyrics.length)];
  }, []);

  const initialState = {
    displayText: '',
    phase: 'typing',
    charIndex: 0,
    currentLyric: getRandomLyric(),
  };

  const reducer = (state, action) => {
    switch (action.type) {
      case 'ADD_CHAR':
        return {
          ...state,
          displayText: state.displayText + state.currentLyric[state.charIndex],
          charIndex: state.charIndex + 1,
        };
      case 'MOVE_TO_WAITING':
        return { ...state, phase: 'waiting' };
      case 'MOVE_TO_DELETING':
        return { ...state, phase: 'deleting' };
      case 'REMOVE_CHAR':
        return {
          ...state,
          displayText: state.displayText.slice(0, -1),
          charIndex: state.charIndex - 1,
        };
      case 'NEW_LYRIC':
        return {
          ...state,
          currentLyric: action.payload,
          displayText: '',
          charIndex: 0,
          phase: 'typing',
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const shortLimit = 20;
    const isShort = state.currentLyric.length <= shortLimit;
    const typeSpeed = isShort ? 60 : 80;
    const deleteSpeed = isShort ? 35 : 45;
    const waitTime = isShort ? 2000 : 3000;

    let timer;

    if (state.phase === 'typing') {
      if (state.charIndex < state.currentLyric.length) {
        timer = setTimeout(() => {
          dispatch({ type: 'ADD_CHAR' });
        }, typeSpeed);
      } else {
        timer = setTimeout(() => {
          dispatch({ type: 'MOVE_TO_WAITING' });
        }, waitTime);
      }
    } else if (state.phase === 'waiting') {
      timer = setTimeout(() => {
        dispatch({ type: 'MOVE_TO_DELETING' });
      }, 0);
    } else if (state.phase === 'deleting') {
      if (state.charIndex > 0) {
        timer = setTimeout(() => {
          dispatch({ type: 'REMOVE_CHAR' });
        }, deleteSpeed);
      } else {
        const next = getRandomLyric();
        dispatch({ type: 'NEW_LYRIC', payload: next });
      }
    }

    return () => clearTimeout(timer);
  }, [state.phase, state.charIndex, state.currentLyric, getRandomLyric]);

  return (
    <div className="lyrics-typewriter">
      <span className="lyrics-text">{state.displayText}</span>
      <span className="lyrics-cursor">|</span>
    </div>
  );
}