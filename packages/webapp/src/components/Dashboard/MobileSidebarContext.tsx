// @ts-nocheck
import React, { createContext, useContext } from 'react';
import { useMobileSidebar, useIsMobile } from '@/hooks/useMobileResponsive';

const MobileSidebarContext = createContext({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
  isMobile: false,
});

export function MobileSidebarProvider({ children }) {
  const mobileSidebar = useMobileSidebar();

  return (
    <MobileSidebarContext.Provider value={mobileSidebar}>
      {children}
    </MobileSidebarContext.Provider>
  );
}

export function useMobileSidebarContext() {
  return useContext(MobileSidebarContext);
}
