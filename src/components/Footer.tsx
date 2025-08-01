import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-primary border-t border-border-default py-4 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-3">
        <img src="/logo-square.svg" alt="AGORA" className="w-5 h-5" />
        <span className="text-xs text-text-secondary">
          © 2026 AGORA. All rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer; 