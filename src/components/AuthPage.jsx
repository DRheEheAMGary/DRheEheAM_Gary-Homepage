import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { register as wpRegister, verifyTurnstile } from '../api/wordpress';
import TurnstileWidget from './TurnstileWidget';
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaHeart,
  FaCloud,
  FaCheckCircle,
} from 'react-icons/fa';

export default function AuthPage({ onBack, onModeSwitch }) {
  const { login } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // 登录字段
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // 注册字段
  const [regUser, setRegUser] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regPass2, setRegPass2] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [bypassTurnstile, setBypassTurnstile] = useState(false);

  // 控制台调试：window.toggleTurnstile('密码') 开关人机验证
  useEffect(() => {
    // SHA-256 哈希，原文不存源码中
    const HASH = 'ae426c69bf9d4fb31d23bead043af5d0701e67e3015c30fb9dd0ba80d9cbf9db';
    window.toggleTurnstile = async (pass) => {
      if (!pass) {
        console.log('用法: window.toggleTurnstile("密码")');
        return;
      }
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(pass));
      const hashHex = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      if (hashHex !== HASH) {
        console.log('❌ 密钥错误');
        return;
      }
      setBypassTurnstile(v => {
        console.log(v ? '✅ 已恢复人机验证' : '✅ 已关闭人机验证');
        return !v;
      });
    };
    return () => { delete window.toggleTurnstile; };
  }, []);

  const tabsRef = useRef(null);
  const [indStyle, setIndStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;
    const activeBtn = container.querySelector('.auth-tab.active');
    if (!activeBtn) return;
    const cRect = container.getBoundingClientRect();
    const bRect = activeBtn.getBoundingClientRect();
    setIndStyle({ left: bRect.left - cRect.left, width: bRect.width });
  }, [mode]);

  const resetForm = () => {
    setUsername(''); setPassword('');
    setRegUser(''); setRegEmail(''); setRegPass(''); setRegPass2('');
    setError(''); setSuccess('');
    setTurnstileToken(null);
    setTurnstileReset((n) => n + 1);
  };

  const switchMode = (m) => {
    resetForm();
    setMode(m);
    onModeSwitch?.();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }
    if (!bypassTurnstile && !turnstileToken) {
      setError('请完成人机验证');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      if (!bypassTurnstile) await verifyTurnstile(turnstileToken);
      await login(username, password);
      onBack();
    } catch (err) {
      setError(err.message || '登录失败，请重试');
      setTurnstileToken(null);
      setTurnstileReset((n) => n + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regUser.trim() || !regEmail.trim() || !regPass.trim()) {
      setError('请填写所有字段');
      return;
    }
    if (regPass !== regPass2) {
      setError('两次密码不一致');
      return;
    }
    if (regPass.length < 6) {
      setError('密码至少6位');
      return;
    }
    if (!bypassTurnstile && !turnstileToken) {
      setError('请完成人机验证');
      return;
    }
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await wpRegister(regUser, regEmail, regPass, turnstileToken);
      setSuccess('注册成功！请切换到登录页面进行登录');
      setRegUser(''); setRegEmail(''); setRegPass(''); setRegPass2('');
      setTurnstileToken(null);
      setTurnstileReset((n) => n + 1);
    } catch (err) {
      setError(err.message || '注册失败，请重试');
      setTurnstileToken(null);
      setTurnstileReset((n) => n + 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-container">
        {/* 左侧表单区 */}
        <div className="auth-form-side">
          {/* 切换标签 */}
          <div className="auth-tabs" ref={tabsRef}>
            <div
              className="auth-tab-indicator"
              style={{ transform: `translateX(${indStyle.left}px)`, width: `${indStyle.width}px` }}
            />
            <button
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => switchMode('login')}
            >
              登录
            </button>
            <button
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => switchMode('register')}
            >
              注册
            </button>
          </div>

          {mode === 'login' ? (
            <>
              <h2 className="auth-title">欢迎回来</h2>
              <p className="auth-subtitle">登录后打卡数据将云端同步</p>
              <form onSubmit={handleLogin} className="auth-form">
                <div className="auth-field">
                  <FaUser className="auth-field-icon" />
                  <input
                    type="text"
                    placeholder="用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="auth-field">
                  <FaLock className="auth-field-icon" />
                  <input
                    type="password"
                    placeholder="密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="auth-error">{error}</p>}
                <TurnstileWidget
                  key={`login-${turnstileReset}`}
                  onVerify={(t) => setTurnstileToken(t)}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setTurnstileToken(null)}
                />
                <button type="submit" className="auth-submit" disabled={submitting || (!bypassTurnstile && !turnstileToken)}>
                  {submitting ? '登录中...' : '登 录'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="auth-title">创建账号</h2>
              <p className="auth-subtitle">注册后即可使用云端打卡功能</p>
              <form onSubmit={handleRegister} className="auth-form">
                <div className="auth-field">
                  <FaUser className="auth-field-icon" />
                  <input
                    type="text"
                    placeholder="用户名"
                    value={regUser}
                    onChange={(e) => setRegUser(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="auth-field">
                  <FaEnvelope className="auth-field-icon" />
                  <input
                    type="email"
                    placeholder="邮箱"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>
                <div className="auth-field">
                  <FaLock className="auth-field-icon" />
                  <input
                    type="password"
                    placeholder="密码（至少6位）"
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                  />
                </div>
                <div className="auth-field">
                  <FaLock className="auth-field-icon" />
                  <input
                    type="password"
                    placeholder="确认密码"
                    value={regPass2}
                    onChange={(e) => setRegPass2(e.target.value)}
                  />
                </div>
                {error && <p className="auth-error">{error}</p>}
                {success && <p className="auth-success">{success}</p>}
                <TurnstileWidget
                  key={`reg-${turnstileReset}`}
                  onVerify={(t) => setTurnstileToken(t)}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setTurnstileToken(null)}
                />
                <button type="submit" className="auth-submit" disabled={submitting || (!bypassTurnstile && !turnstileToken)}>
                  {submitting ? '注册中...' : '注 册'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* 右侧信息区 */}
        <div className="auth-info-side">
          <div className="auth-info-card">
            <FaHeart className="auth-info-icon" />
            <h3 className="auth-info-title">云端打卡</h3>
            <ul className="auth-info-list">
              <li><FaCheckCircle /> 数据云端存储，永不丢失</li>
              <li><FaCheckCircle /> 多设备自动同步</li>
              <li><FaCheckCircle /> 连续打卡天数统计</li>
              <li><FaCheckCircle /> 每日运势永久保存</li>
            </ul>
          </div>
          <div className="auth-info-card">
            <FaCloud className="auth-info-icon" />
            <h3 className="auth-info-title">数据安全</h3>
            <p className="auth-info-text">
              基于 WordPress 账号体系，数据加密传输，
              仅存储打卡日期与运势信息。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
