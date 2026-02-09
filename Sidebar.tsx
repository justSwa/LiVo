import React, { useState } from 'react';
import { AppView, UserProfile } from '../types';
import { auth } from '../services/firebase';
import { signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import LiVoLogo from './logo';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  user: UserProfile | null;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, user }) => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const navItems = [
    { view: AppView.DASHBOARD, icon: 'fa-house', label: 'Dashboard' },
    { view: AppView.CHAT, icon: 'fa-gem', label: 'Assistant' },
    { view: AppView.MIND_VAULT, icon: 'fa-brain', label: 'Mind Vault' },
    { view: AppView.FLOW, icon: 'fa-water', label: 'Flow' },
    { view: AppView.SETTINGS, icon: 'fa-gear', label: 'Settings' },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    setShowAccountMenu(false);
  };

  const handleSwitchAccount = async () => {
    try {
      const googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      
      await signOut(auth);
      await signInWithPopup(auth, googleProvider);
      setShowAccountMenu(false);
    } catch (error) {
      console.error('Error switching account:', error);
    }
  };

  return (
    <nav className="w-20 md:w-64 bg-white border-r border-[var(--app-accent)]/10 flex flex-col h-full shrink-0 z-20">
      {/* Logo Section - Uses customizable logo */}
      <div className="p-5 md:p-10 flex items-center justify-center md:justify-start gap-3">
        <LiVoLogo 
          size={48} 
          color="var(--app-accent)" 
          className="transform -rotate-3 transition-transform hover:rotate-0" 
        />
        <div className="hidden md:block">
          <span className="font-bold text-2xl text-stone-900 tracking-tight">LiVo</span>
          <p className="text-[10px] text-[var(--app-accent)] font-black tracking-widest uppercase -mt-1">Presence</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 mt-4 md:mt-6 px-3 md:px-4 space-y-1 md:space-y-2 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`w-full group flex items-center justify-center md:justify-start p-3 md:p-4 rounded-2xl transition-all duration-300 relative ${
                isActive
                  ? 'bg-[var(--app-accent-light)] text-[var(--app-accent-deep)] shadow-sm border border-[var(--app-accent)]/10'
                  : 'text-stone-900 hover:bg-stone-50 hover:text-[var(--app-accent)]'
              }`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
                isActive ? 'text-[var(--app-accent)]' : 'group-hover:text-[var(--app-accent)]'
              }`}>
                <i className={`fas ${item.icon} text-lg md:text-xl`}></i>
              </div>
              <span className={`hidden md:block ml-3 font-black text-sm md:text-base transition-colors ${
                isActive ? 'text-[var(--app-accent-deep)]' : 'text-stone-900'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Account Section - Bottom Left with Popup */}
      <div className="p-4 md:p-8 relative">
        <div className="pt-4 md:pt-6 border-t border-stone-100">
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="flex items-center gap-3 md:gap-4 p-2 rounded-2xl transition-all group hover:bg-stone-50 w-full"
          >
            <div 
              className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md font-bold text-lg"
              style={{ backgroundColor: 'var(--app-accent)' }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block overflow-hidden flex-1">
              <p className="text-sm font-black text-stone-900 truncate tracking-tight">{user?.name || 'User'}</p>
              <p className="text-[10px] text-stone-600 truncate">{user?.email}</p>
            </div>
            <i className={`hidden md:block fas ${showAccountMenu ? 'fa-chevron-down' : 'fa-chevron-up'} text-xs text-stone-400 group-hover:text-stone-600 transition-all`}></i>
          </button>

          {/* Account Menu Popup */}
          {showAccountMenu && (
            <>
              {/* Backdrop to close menu when clicking outside */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowAccountMenu(false)}
              />
              
              {/* Menu */}
              <div className="absolute bottom-full left-4 right-4 md:left-4 md:right-4 mb-2 bg-white rounded-2xl shadow-2xl border border-stone-200 p-3 animate-fadeIn z-50">
                <div className="mb-3 pb-3 border-b border-stone-100">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Account</p>
                  <p className="text-sm font-bold text-stone-900">{user?.name}</p>
                  <p className="text-xs text-stone-600 truncate">{user?.email}</p>
                </div>
                
                <div className="space-y-1">
                  <button
                    onClick={handleSwitchAccount}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-stone-50 transition-colors flex items-center gap-3 text-stone-700 text-sm font-medium"
                  >
                    <i className="fas fa-user-plus w-4"></i>
                    Switch Account
                  </button>
                  
                  <button
                    onClick={() => {
                      setView(AppView.SETTINGS);
                      setShowAccountMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-stone-50 transition-colors flex items-center gap-3 text-stone-700 text-sm font-medium"
                  >
                    <i className="fas fa-cog w-4"></i>
                    Settings
                  </button>
                  
                  <div className="border-t border-stone-100 my-2"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 transition-colors flex items-center gap-3 text-red-600 text-sm font-medium"
                  >
                    <i className="fas fa-sign-out-alt w-4"></i>
                    Log Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;