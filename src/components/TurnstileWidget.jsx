import { useEffect, useRef } from 'react';

const SITE_KEY = '0x4AAAAAADCXUzgWHNGnWoQN';

export default function TurnstileWidget({ onVerify, onExpire, onError, reset }) {
  const ref = useRef(null);
  const widgetId = useRef(null);
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);

  // 始终同步最新回调
  useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timer = null;

    const cleanup = () => {
      if (timer) clearInterval(timer);
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };

    const init = () => {
      if (!window.turnstile) return;
      cleanup(); // 先清理旧 widget
      widgetId.current = window.turnstile.render(el, {
        sitekey: SITE_KEY,
        theme: 'auto',
        callback: (token) => onVerifyRef.current?.(token),
        'expired-callback': () => onExpireRef.current?.(),
        'error-callback': () => onErrorRef.current?.(),
      });
    };

    if (window.turnstile) {
      init();
    } else {
      timer = setInterval(() => {
        if (window.turnstile) {
          clearInterval(timer);
          timer = null;
          init();
        }
      }, 200);
    }

    return cleanup;
  }, [reset]);

  return <div ref={ref} className="turnstile-container" />;
}
