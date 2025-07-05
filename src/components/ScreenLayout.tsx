import React from 'react';
import './ScreenLayout.css';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="page-wrapper">
      <div className="app-wrapper">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;
