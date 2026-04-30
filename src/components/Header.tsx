import React from 'react';

const Header: React.FC = () => {
  return (
    <header id="app-header" className="relative overflow-hidden">
      {/* Gradient glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo icon */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                <span className="gradient-text">RenameFlow</span>
              </h1>
              <p className="text-xs text-[var(--rf-text-muted)] mt-0.5">
                Bulk Image Renaming & WEBP Conversion
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="badge badge-success">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--rf-success)] animate-pulse" />
              100% Client-Side
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
