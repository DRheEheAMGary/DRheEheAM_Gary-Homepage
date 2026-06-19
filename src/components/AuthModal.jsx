import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaLock, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';

export default function AuthModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
      onClose();
    } catch (err) {
      setError(err.message || '登录失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="auth-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal">
        <button className="auth-close" onClick={onClose}>
          <FaTimes />
        </button>

        <h2 className="auth-title">登录</h2>
        <p className="auth-subtitle">登录后打卡数据将云端同步</p>

        <form onSubmit={handleSubmit} className="auth-form">
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

          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? '登录中...' : '登 录'}
          </button>
        </form>

        <p className="auth-footer">
          还没有账号？
          <a
            href="https://blog.dreamgary.cn/wp-login.php?action=register"
            target="_blank"
            rel="noopener noreferrer"
            className="auth-register-link"
          >
            前往注册 <FaExternalLinkAlt size={10} />
          </a>
        </p>
      </div>
    </div>
  );
}
