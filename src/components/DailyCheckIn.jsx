import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FaCalendarCheck,
  FaFire,
  FaChevronLeft,
  FaChevronRight,
  FaTrophy,
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import * as wpApi from '../api/wordpress';

const STORAGE_KEY = 'daily-checkin-dates';
const FORTUNE_KEY = 'daily-fortune';

const FORTUNES = ['大凶', '凶', '中平', '小吉', '中吉', '大吉'];

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}


function generateFortune() {
  const value = Math.floor(Math.random() * 101); // 0-100
  const luck = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
  return { value, luck };
}

function loadCheckedDates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveCheckedDates(dates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dates));
}

function calcStreak(checkedSet) {
  let streak = 0;
  const d = new Date();
  // 从今天往前数
  while (true) {
    const key = getDateStr(d.getFullYear(), d.getMonth(), d.getDate());
    if (checkedSet.has(key)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function DailyCheckIn() {
  const { user } = useAuth();
  const todayStr = getToday();
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth()); // 0-based
  const [checkedDates, setCheckedDates] = useState(() => user ? loadCheckedDates() : []);
  const [animating, setAnimating] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const wrapperRef = useRef(null);
  const popupRef = useRef(null);
  const [fortune, setFortune] = useState(() => {
    if (!user) return null;
    try {
      const raw = localStorage.getItem(FORTUNE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.date === todayStr) return data;
      }
    } catch { /* ignore */ }
    return null;
  });
  const [synced, setSynced] = useState(false);

  // 登录后从云端拉取打卡数据
  useEffect(() => {
    if (!user || synced) return;
    (async () => {
      try {
        const cloudDates = await wpApi.getCheckinDates();
        if (cloudDates && cloudDates.length > 0) {
          setCheckedDates(cloudDates);
          saveCheckedDates(cloudDates);
        }
        const cloudFortune = await wpApi.getDailyFortune();
        if (cloudFortune) {
          setFortune(cloudFortune);
          localStorage.setItem(FORTUNE_KEY, JSON.stringify({ date: todayStr, ...cloudFortune }));
        }
      } catch { /* ignore */ }
      setSynced(true);
    })();
  }, [user, synced, todayStr]);

  const checkedSet = new Set(checkedDates);
  const isTodayChecked = checkedSet.has(todayStr);
  const streak = calcStreak(checkedSet);

  // 当月已打卡天数
  const monthCheckedCount = checkedDates.filter((d) => {
    const [y, m] = d.split('-').map(Number);
    return y === currentYear && m === currentMonth + 1;
  }).length;

  const toggleToday = useCallback(() => {
    if (!user) return;
    if (animating) return;

    // 已打卡：切换日历弹窗
    if (isTodayChecked) {
      setShowPopup((prev) => !prev);
      return;
    }

    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);

    const newFortune = generateFortune();
    setFortune(newFortune);

    // 同步到云端
    wpApi.addCheckinDate(todayStr).catch(() => {});
    wpApi.saveDailyFortune(newFortune).catch(() => {});

    setCheckedDates((prev) => {
      const next = [...prev, todayStr];
      saveCheckedDates(next);
      return next;
    });
  }, [todayStr, animating, isTodayChecked, user]);

  // 点击日历弹窗外区域关闭弹窗
  useEffect(() => {
    if (!showPopup) return;
    const handleClickOutside = (e) => {
      if (
        wrapperRef.current && !wrapperRef.current.contains(e.target)
      ) {
        setShowPopup(false);
      }
    };
    // 延迟绑定，避免本次点击事件触发
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showPopup]);

  // 跨天自动刷新
  useEffect(() => {
    const now = new Date();
    const msToMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    const timer = setTimeout(() => {
      setCheckedDates(loadCheckedDates());
      setFortune(null);
      localStorage.removeItem(FORTUNE_KEY);
    }, msToMidnight + 1000);
    return () => clearTimeout(timer);
  }, []);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // 生成当月日历格子
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const cells = [];

  // 前置空白
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: null, key: `empty-${i}` });
  }
  // 日期
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = getDateStr(currentYear, currentMonth, d);
    const isToday = dateStr === todayStr;
    const isChecked = checkedSet.has(dateStr);
    cells.push({ day: d, key: dateStr, isToday, isChecked, dateStr });
  }

  // 人品值颜色：红(0) → 黄(33) → 蓝(66) → 绿(100)
  const getValueColor = (v) => {
    const stops = [
      { p: 0, r: 239, g: 68, b: 68 },    // 红 #ef4444
      { p: 33, r: 245, g: 158, b: 11 },   // 黄 #f59e0b
      { p: 66, r: 59, g: 130, b: 246 },   // 蓝 #3b82f6
      { p: 100, r: 34, g: 197, b: 94 },   // 绿 #22c55e
    ];
    for (let i = 1; i < stops.length; i++) {
      if (v <= stops[i].p) {
        const a = stops[i - 1], b = stops[i];
        const t = (v - a.p) / (b.p - a.p);
        const r = Math.round(a.r + (b.r - a.r) * t);
        const g = Math.round(a.g + (b.g - a.g) * t);
        const bl = Math.round(a.b + (b.b - a.b) * t);
        return `rgb(${r},${g},${bl})`;
      }
    }
    return 'rgb(34,197,94)';
  };

  // 运势颜色
  const getLuckColor = (luck) => {
    if (luck.includes('凶')) return 'var(--text)';
    if (luck === '中平') return '#22c55e';
    if (luck.includes('吉')) return '#ef4444';
    return 'var(--text)';
  };

  return (
    <div className="checkin-row">
      <div
        className="checkin-wrapper"
        ref={wrapperRef}
      >
        {/* 日历弹出层 */}
        <div className={`checkin-popup ${showPopup ? 'visible' : ''}`} ref={popupRef}>
          {/* 头部：标题 + 统计 */}
          <div className="checkin-header">
            <div className="checkin-title-row">
              <FaCalendarCheck className="checkin-title-icon" />
              <span className="checkin-title">每日打卡</span>
            </div>
            <div className="checkin-stats">
              {streak > 0 && (
                <span className="checkin-streak" title="连续打卡天数">
                  <FaFire className="checkin-streak-icon" />
                  {streak} 天
                </span>
              )}
              {streak >= 7 && (
                <span className="checkin-trophy" title="连续7天达成!">
                  <FaTrophy />
                </span>
              )}
            </div>
          </div>

          {/* 月份导航 */}
          <div className="checkin-month-nav">
            <button className="checkin-nav-btn" onClick={prevMonth}>
              <FaChevronLeft />
            </button>
            <span className="checkin-month-label">
              {currentYear}年 {currentMonth + 1}月
              <span className="checkin-month-count">（已打卡 {monthCheckedCount} 天）</span>
            </span>
            <button className="checkin-nav-btn" onClick={nextMonth}>
              <FaChevronRight />
            </button>
          </div>

          {/* 星期表头 */}
          <div className="checkin-weekdays">
            {WEEKDAYS.map((w) => (
              <span key={w} className="checkin-weekday">{w}</span>
            ))}
          </div>

          {/* 日历格子 */}
          <div className="checkin-grid">
            {cells.map((cell) =>
              cell.day === null ? (
                <div key={cell.key} className="checkin-cell empty" />
              ) : (
                <div
                  key={cell.key}
                  className={`checkin-cell ${cell.isChecked ? 'checked' : ''} ${cell.isToday ? 'today' : ''}`}
                  title={cell.isToday ? (cell.isChecked ? '已打卡 ✓' : '点击打卡') : cell.dateStr}
                  onClick={() => { if (cell.isToday) toggleToday(); }}
                >
                  <span className="checkin-day-num">{cell.day}</span>
                  {cell.isChecked && <span className="checkin-dot">✓</span>}
                </div>
              )
            )}
          </div>
        </div>

        {/* 圆形打卡按钮 */}
        <button
          className={`checkin-btn ${!user ? 'unauth' : ''} ${isTodayChecked ? 'checked' : ''} ${animating ? 'animating' : ''}`}
          onClick={toggleToday}
          title={user ? (isTodayChecked ? '今日已打卡（点击查看日历）' : '点击打卡') : '未登录'}
        >
          <FaCalendarCheck />
          <span className="checkin-btn-label">{user ? '打卡' : '未登录'}</span>
          {user && streak > 0 && (
            <span className="checkin-btn-streak">
              <FaFire /> {streak}
            </span>
          )}
        </button>
      </div>

      {/* 运势文字（在 wrapper 外面，不触发弹窗） */}
      <div className="checkin-fortune">
        {isTodayChecked && fortune && (
          <>
            <span className="checkin-fortune-value" style={{ color: getValueColor(fortune.value) }}>
              今日人品值 {fortune.value}
            </span>
            <span className="checkin-fortune-luck" style={{ color: getLuckColor(fortune.luck) }}>
              今日运势：{fortune.luck}
            </span>
          </>
        )}
      </div>

    </div>
  );
}
