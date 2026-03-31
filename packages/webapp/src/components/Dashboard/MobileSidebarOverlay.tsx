// @ts-nocheck
import React, { useEffect } from 'react';
import classNames from 'classnames';
import { useHistory } from 'react-router';
import { Sidebar } from '@/containers/Dashboard/Sidebar/Sidebar';

/**
 * Mobile sidebar overlay - renders the sidebar as a slide-in drawer
 * overlaying the content on mobile screens.
 */
export function MobileSidebarOverlay({ isOpen, onClose }) {
  const history = useHistory();

  // Close when navigating to a new route
  useEffect(() => {
    const unlisten = history.listen(() => {
      if (isOpen) {
        onClose();
      }
    });
    return unlisten;
  }, [history, isOpen, onClose]);

  return (
    <div
      className={classNames('sidebar-mobile-overlay', {
        'is-open': isOpen,
      })}
    >
      <button
        className="sidebar-mobile-overlay__backdrop"
        onClick={onClose}
        aria-label="Close sidebar"
        type="button"
      />
      <div className="sidebar-mobile-overlay__drawer">
        <Sidebar />
      </div>
    </div>
  );
}
