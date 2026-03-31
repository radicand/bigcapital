// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Returns true if viewport is at or below mobile breakpoint.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const handler = (e) => setIsMobile(e.matches);
    
    // Set initial value
    setIsMobile(mql.matches);
    
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isMobile;
}

/**
 * Manages mobile sidebar open/close state.
 */
export function useMobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  // Close mobile sidebar when switching away from mobile
  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  return { isOpen, open, close, toggle, isMobile };
}
