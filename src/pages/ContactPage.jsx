import { FaEnvelope, FaPhone, FaQq } from 'react-icons/fa';
import { SiBilibili } from 'react-icons/si';
import { FaCopy, FaCheck } from 'react-icons/fa';
import { useState } from 'react';
import profile from '../data/profile.js';

export default function ContactPage() {
  const [copied, setCopied] = useState(null);

  const copyText = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const iconMap = {
    'fa-envelope': FaEnvelope,
    'fa-qq': FaQq,
    'fa-phone': FaPhone,
    'fa-bilibili': SiBilibili,
  };

  return (
    <div className="page contact-page">
      <h2>联系方式</h2>
      <div className="contact-cards">
        {profile.contacts.map((c, i) => (
          <div key={i} className="contact-card" onClick={() => c.type === 'email' && copyText(c.value)}>
            <span className="contact-icon">{(() => { const Icon = iconMap[c.icon]; return Icon ? <Icon /> : '·'; })()}</span>
            <span className="contact-value">{c.display}</span>
            {c.type === 'email' && (
              <button className="copy-btn" title="复制">
                {copied === c.value ? <FaCheck /> : <FaCopy />}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
