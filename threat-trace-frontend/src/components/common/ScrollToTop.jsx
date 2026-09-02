import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll standard window
    window.scrollTo(0, 0);

    // Scroll document elements
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Scroll main element if it has internal overflow
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
  }, [pathname]);

  return null;
}
