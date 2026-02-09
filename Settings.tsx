import React, { useState } from 'react';
import { UserProfile, ThemeOption } from '../types';
import { auth } from '../services/firebase';
import { signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface SettingsProps {
  user: UserProfile;
  setUser: (user: UserProfile | null) => Promise<void>;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, setUser, onLogout }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isSaving, setIsSaving] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const SUPPORT_EMAIL = "queries.livo@gmail.com";

  // Updated theme colors with exact values from App.tsx
  const THEME_OPTIONS: Array<{ id: ThemeOption; label: string; accent: string; deep: string; light: string; bg: string }> = [
    { id: 'beige', label: 'Warm Beige', accent: '#d2b48c', deep: '#8b7355', light: '#f5f1e8', bg: '#fdfaf5' },
    { id: 'rose', label: 'Dusty Rose', accent: '#d4a5a5', deep: '#a67c7c', light: '#f5ebeb', bg: '#faf7f7' },
    { id: 'lavender', label: 'Lavender Grey', accent: '#b5a8b9', deep: '#7e7482', light: '#efebf0', bg: '#f9f8fa' },
    { id: 'blue', label: 'Powder Blue', accent: '#b0c4de', deep: '#708090', light: '#e6eef3', bg: '#f5f8fa' },
    { id: 'sage', label: 'Sage Green', accent: '#b2ac88', deep: '#747d63', light: '#ecede8', bg: '#f8f9f7' },
    { id: 'teal', label: 'Muted Teal', accent: '#78a2a2', deep: '#4a6d6d', light: '#e6eeee', bg: '#f4f8f8' },
    { id: 'grey', label: 'Deep Grey', accent: '#707070', deep: '#333333', light: '#e0e0e0', bg: '#f5f5f5' },
  ];

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await setUser({ ...user, name, email });
      alert("Settings updated successfully!");
    } catch (e) {
      alert("Update failed. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const changeTheme = async (theme: ThemeOption) => {
    const selectedTheme = THEME_OPTIONS.find(t => t.id === theme);
    if (selectedTheme) {
      // Apply theme immediately to CSS variables
      document.documentElement.style.setProperty('--app-accent', selectedTheme.accent);
      document.documentElement.style.setProperty('--app-accent-deep', selectedTheme.deep);
      document.documentElement.style.setProperty('--app-accent-light', selectedTheme.light);
      document.documentElement.style.setProperty('--app-bg', selectedTheme.bg);
      
      // Save to database
      await setUser({ ...user, themeColor: theme });
    }
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
      alert('Failed to switch account. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
    );
    
    if (confirmed) {
      const doubleConfirm = window.prompt(
        'Type "DELETE" to confirm account deletion:'
      );
      
      if (doubleConfirm === 'DELETE') {
        try {
          const currentUser = auth.currentUser;
          if (currentUser) {
            await currentUser.delete();
            alert('Your account has been deleted.');
          }
        } catch (error: any) {
          console.error('Error deleting account:', error);
          if (error.code === 'auth/requires-recent-login') {
            alert('For security, please log out and log back in before deleting your account.');
          } else {
            alert('Failed to delete account. Please try again.');
          }
        }
      }
    }
  };

  return (
    <div className="p-8 md:p-12 max-w-3xl mx-auto pb-32">
      <h1 className="text-4xl font-bold text-stone-900 mb-10 tracking-tight">Settings</h1>

      <div className="space-y-10">
        {/* Account Info Section - NEW */}
        <section className="bg-gradient-to-br from-[var(--app-accent-light)] to-white rounded-[2.5rem] p-8 border border-[var(--app-accent)]/20 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-[var(--app-accent)] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-stone-900">{user.name}</h3>
              <p className="text-stone-600 text-sm">{user.email}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex-1 px-4 py-3 bg-white border-2 border-[var(--app-accent)] text-[var(--app-accent-deep)] font-bold rounded-xl hover:bg-[var(--app-accent-light)] transition-all"
            >
              Switch Account
            </button>
          </div>

          {showAccountMenu && (
            <div className="mt-4 p-4 bg-white rounded-2xl border border-stone-200 animate-fadeIn">
              <p className="text-sm text-stone-600 mb-3">Quick account actions:</p>
              <div className="space-y-2">
                <button
                  onClick={handleSwitchAccount}
                  className="w-full p-3 text-left bg-stone-50 hover:bg-stone-100 rounded-xl text-stone-700 font-medium transition-all flex items-center gap-3"
                >
                  <i className="fas fa-user-plus"></i>
                  Sign in with different Google account
                </button>
                <button
                  onClick={onLogout}
                  className="w-full p-3 text-left bg-stone-50 hover:bg-stone-100 rounded-xl text-stone-700 font-medium transition-all flex items-center gap-3"
                >
                  <i className="fas fa-sign-out-alt"></i>
                  Log out
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Aura Section */}
        <section className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm transition-all hover:shadow-md">
          <h3 className="text-xl font-bold text-stone-900 mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--app-accent-light)] rounded-xl flex items-center justify-center text-[var(--app-accent)] border border-[var(--app-accent)]/10">
              <i className="fas fa-palette"></i>
            </div>
            App Aura
          </h3>
          <p className="text-stone-500 text-sm font-medium mb-8">Choose the primary accent for your LiVo experience. Changes apply immediately.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {THEME_OPTIONS.map((theme) => (
              <button
                key={theme.id}
                onClick={() => changeTheme(theme.id)}
                className={`flex flex-col items-center gap-3 p-4 rounded-[2rem] border-2 transition-all ${
                  user.themeColor === theme.id 
                    ? 'border-[var(--app-accent)] bg-[var(--app-accent-light)] shadow-md scale-105' 
                    : 'border-stone-100 bg-stone-50 hover:border-stone-200 hover:shadow-sm'
                }`}
              >
                <div 
                  className="w-10 h-10 rounded-full shadow-md border-2 border-white" 
                  style={{ backgroundColor: theme.accent }}
                />
                <span className={`text-[10px] font-black uppercase tracking-widest ${
                  user.themeColor === theme.id ? 'text-[var(--app-accent-deep)]' : 'text-stone-400'
                }`}>
                  {theme.label}
                </span>
                {user.themeColor === theme.id && (
                  <div className="text-[var(--app-accent)] text-lg">✓</div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Profile Section */}
        <section className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm transition-all hover:shadow-md">
          <h3 className="text-xl font-bold text-stone-900 mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--app-accent-light)] rounded-xl flex items-center justify-center text-[var(--app-accent)] border border-[var(--app-accent)]/10">
              <i className="fas fa-user-circle"></i>
            </div>
            User Profile
          </h3>
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--app-accent-light)] transition-all text-stone-900 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl opacity-50 cursor-not-allowed text-stone-900 font-medium"
              />
              <p className="text-xs text-stone-400 mt-2 ml-1">Email cannot be changed</p>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[var(--app-accent)] text-white px-8 py-4 rounded-2xl font-black text-lg shadow-lg hover:brightness-110 transition-all disabled:opacity-50 active:scale-95"
            >
              {isSaving ? 'Preserving...' : 'Update Information'}
            </button>
          </form>
        </section>

        {/* Privacy & Data Section - NEW */}
        <section className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm transition-all hover:shadow-md">
          <h3 className="text-xl font-bold text-stone-900 mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--app-accent-light)] rounded-xl flex items-center justify-center text-[var(--app-accent)] border border-[var(--app-accent)]/10">
              <i className="fas fa-shield-alt"></i>
            </div>
            Privacy & Data
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-stone-50 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-stone-900">Google Calendar Sync</span>
                <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">
                  Connected
                </span>
              </div>
              <p className="text-sm text-stone-600">
                We can read your calendar events to help organize your schedule
              </p>
            </div>
            
            <button
              className="w-full p-4 text-left bg-stone-50 hover:bg-stone-100 rounded-2xl text-stone-700 font-medium transition-all flex items-center justify-between"
            >
              <span className="flex items-center gap-3">
                <i className="fas fa-download"></i>
                Download My Data
              </span>
              <i className="fas fa-chevron-right text-xs"></i>
            </button>

            <button
              className="w-full p-4 text-left bg-stone-50 hover:bg-stone-100 rounded-2xl text-stone-700 font-medium transition-all flex items-center justify-between"
            >
              <span className="flex items-center gap-3">
                <i className="fas fa-file-alt"></i>
                Privacy Policy
              </span>
              <i className="fas fa-external-link-alt text-xs"></i>
            </button>
          </div>
        </section>

        {/* Support Section */}
        <section className="bg-stone-50 rounded-[2.5rem] p-8 border border-stone-200 shadow-sm">
          <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[var(--app-accent)] shadow-sm">
              <i className="fas fa-envelope-open-text"></i>
            </div>
            Support & Feedback
          </h3>
          <p className="text-stone-600 text-sm font-medium mb-6 leading-relaxed">
            Need help? Have suggestions? We'd love to hear from you.
          </p>
          <a 
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-flex items-center gap-3 text-[var(--app-accent)] font-black hover:underline underline-offset-4 transition-all"
          >
            {SUPPORT_EMAIL}
            <i className="fas fa-external-link-alt text-xs"></i>
          </a>
        </section>

        {/* Account Actions Section */}
        <section className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm transition-all hover:shadow-md">
          <h3 className="text-xl font-bold text-stone-900 mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--app-accent-light)] rounded-xl flex items-center justify-center text-[var(--app-accent)] border border-[var(--app-accent)]/10">
              <i className="fas fa-id-card"></i>
            </div>
            Account Actions
          </h3>
          <div className="space-y-4">
            <button 
              onClick={onLogout}
              className="w-full p-6 bg-stone-50 text-stone-700 font-bold rounded-[2rem] flex items-center justify-between hover:bg-stone-100 transition-all border border-stone-200"
            >
              <span className="flex items-center gap-4">
                <i className="fas fa-sign-out-alt text-lg"></i>
                Log Out
              </span>
              <i className="fas fa-chevron-right text-sm"></i>
            </button>

            <button 
              onClick={handleDeleteAccount}
              className="w-full p-6 bg-red-50 text-red-600 font-bold rounded-[2rem] flex items-center justify-between hover:bg-red-100 transition-all border border-red-100/50"
            >
              <span className="flex items-center gap-4">
                <i className="fas fa-trash-alt text-lg"></i>
                Delete Account
              </span>
              <i className="fas fa-exclamation-triangle text-sm"></i>
            </button>
          </div>
        </section>

        {/* App Version - NEW */}
        <div className="text-center text-sm text-stone-400">
          <p>LiVo v1.0.0</p>
          <p className="text-xs mt-1">Made with 💚 for a calmer way to live</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;