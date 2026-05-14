import { useEffect, useRef, useState } from 'react';

const PER_ELEM_DELAY = 60;

// 列表容器类名：其直接子元素应单独动画
const LIST_WRAPPERS = [
  'links-grid', 'contact-cards', 'game-cards', 'character-grid',
  'tag-list', 'feed-list',
];

function prepareSection(el) {
  const page = el.querySelector('.page');
  if (!page) return;

  const items = [];
  const collect = (parent) => {
    [...parent.children].forEach((child) => {
      if (LIST_WRAPPERS.some((cls) => child.classList.contains(cls))) {
        // 列表容器：展开其子元素
        collect(child);
      } else {
        items.push(child);
      }
    });
  };
  collect(page);

  items.forEach((child, i) => {
    child.classList.add('animate-el');
    child.style.animationDelay = `${i * PER_ELEM_DELAY}ms`;
  });
}

export default function AnimatedSection({ id, children, manualScrollingFlagRef, targetTabRef, isManualScrolling }) {
  const ref = useRef(null);
  const [entered, setEntered] = useState(false);
  const preparedRef = useRef(false);
  const timerRef = useRef(null);

  // 监听手动滚动状态的变化，当滚动结束时检查是否需要显示已准备的页面
  useEffect(() => {
    if (isManualScrolling || !preparedRef.current || !ref.current) return;

    // 手动滚动结束，检查当前页面是否在视口中
    const rect = ref.current.getBoundingClientRect();
    const winH = window.innerHeight || document.documentElement.clientHeight;
    const inView = rect.top < winH * 0.7 && rect.bottom > winH * 0.3;

    if (inView) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setEntered(true), 60);
    }
  }, [isManualScrolling]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 手动滚动期间，非目标页面必须保持隐藏
        const isManualScrolling = manualScrollingFlagRef.current;
        const isTarget = id === targetTabRef.current;

        if (isManualScrolling && !isTarget) {
          setEntered(false);
          return;
        }

        if (entry.isIntersecting) {
          if (!preparedRef.current) {
            preparedRef.current = true;
            requestAnimationFrame(() => {
              prepareSection(el);
              requestAnimationFrame(() => setEntered(true));
            });
          } else {
            // 已准备过的页面：只有在非手动滚动状态下才显示
            clearTimeout(timerRef.current);
            if (!isManualScrolling) {
              timerRef.current = setTimeout(() => setEntered(true), 60);
            }
          }
        } else {
          setEntered(false);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <section ref={ref} id={id} className={`snap-section${entered ? ' entered' : ''}`}>
      {children}
    </section>
  );
}
