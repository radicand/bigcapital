// @ts-nocheck
import React, { useState, useRef } from 'react';
import SplitPane from 'react-split-pane';
import { debounce } from 'lodash';

import { withDashboard } from '@/containers/Dashboard/withDashboard';
import { useIsMobile } from '@/hooks/useMobileResponsive';
import { compose } from '@/utils';

function DashboardSplitPane({
  sidebarExpended,
  children
}) {
  const initialSize = 220;
  const isMobile = useIsMobile();

  const [defaultSize, setDefaultSize] = useState(
    parseInt(localStorage.getItem('dashboard-size'), 10) || initialSize,
  );
  const debounceSaveSize = useRef(
    debounce((size) => {
      localStorage.setItem('dashboard-size', size);
    }, 500),
  );
  const handleChange = (size) => {
    debounceSaveSize.current(size);
    setDefaultSize(size);
  }

  // On mobile, skip the split pane entirely and render only the content pane
  if (isMobile) {
    // children[0] = Sidebar (skip), children[1] = Content
    const content = React.Children.toArray(children);
    return <div className="dashboard-mobile-content-wrapper">{content[1]}</div>;
  }

  return (
    <SplitPane
      allowResize={sidebarExpended}
      split="vertical"
      minSize={180}
      maxSize={300}
      defaultSize={sidebarExpended ? defaultSize : 50}
      size={sidebarExpended ? defaultSize : 50}
      onChange={handleChange}
      className="primary"
    >
      {children}
    </SplitPane>
  );
}

export default compose(
  withDashboard(({ sidebarExpended }) => ({ sidebarExpended }))
)(DashboardSplitPane);