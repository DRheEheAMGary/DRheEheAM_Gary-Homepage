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

export default function AnimatedSection({ id, children }) {
  const ref = useRef(null);
  const [entered, setEntered] = useState(false);
  const preparedRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!preparedRef.current) {
            preparedRef.current = true;
            requestAnimationFrame(() => {
              prepareSection(el);
              requestAnimationFrame(() => setEntered(true));
            });
          } else {
            clearTimeout(timerRef.current);
            setEntered(false);
            timerRef.current = setTimeout(() => setEntered(true), 60);
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
