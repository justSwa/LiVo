import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, AppView, ChatMessage, Memory, ThemeOption } from './types';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import MindVault from './components/MindVault';
import Flow from './components/Flow';
import Settings from './components/Settings';
import { auth, db } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, set, query, orderByChild, limitToLast } from 'firebase/database';

const THEMES: Record<ThemeOption, { accent: string; deep: string; light: string; bg: string }> = {
  rose: { accent: '#d4a5a5', deep: '#a67c7c', light: '#f5ebeb', bg: '#faf7f7' },
  beige: { accent: '#d2b48c', deep: '#8b7355', light: '#f5f1e8', bg: '#fdfaf5' },
  lavender: { accent: '#b5a8b9', deep: '#7e7482', light: '#efebf0', bg: '#f9f8fa' },
  blue: { accent: '#b0c4de', deep: '#708090', light: '#e6eef3', bg: '#f5f8fa' },
  grey: { accent: '#707070', deep: '#333333', light: '#e0e0e0', bg: '#f5f5f5' },
  sage: { accent: '#b2ac88', deep: '#747d63', light: '#ecede8', bg: '#f8f9f7' },
  teal: { accent: '#78a2a2', deep: '#4a6d6d', light: '#e6eeee', bg: '#f4f8f8' },
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.AUTH);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const currentViewRef = useRef<AppView>(currentView);

  useEffect(() => {
    currentViewRef.current = currentView;
  }, [currentView]);

  useEffect(() => {
    // Listen for auth state using the modular SDK function
    let unsubscribeUser = () => {};
    let unsubscribeMemories = () => {};
    let unsubscribeHistory = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeUser();
      unsubscribeMemories();
      unsubscribeHistory();
      setDbError(null);

      if (user) {
        const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
        const fallbackUser: UserProfile = {
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          preferences: [],
          isOnboarded: !isNewUser,
          themeColor: 'rose'
        };
        setCurrentUser(fallbackUser);
        setCurrentView(isNewUser ? AppView.ONBOARDING : AppView.DASHBOARD);

        const userRef = ref(db, `users/${user.uid}`);
        unsubscribeUser = onValue(userRef, (snap) => {
          if (snap.exists()) {
            const userData = snap.val() as UserProfile;
            if (isNewUser && userData.isOnboarded) {
              const updatedUser = { ...userData, isOnboarded: false };
              set(userRef, updatedUser);
              setCurrentUser(updatedUser);
              setCurrentView(AppView.ONBOARDING);
              return;
            }

            setCurrentUser(userData);
            if (!userData.isOnboarded) {
              setCurrentView(AppView.ONBOARDING);
            } else if (currentViewRef.current === AppView.ONBOARDING) {
              setCurrentView(AppView.DASHBOARD);
            }
          } else {
            const newUser: UserProfile = {
              id: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'User',
              email: user.email || '',
              preferences: [],
              isOnboarded: false,
              themeColor: 'rose'
            };
            set(userRef, newUser);
            setCurrentUser(newUser);
            setCurrentView(AppView.ONBOARDING);
          }
        }, (error) => {
          console.error(error);
          setDbError('Database access denied. Update Firebase Realtime Database rules to allow authenticated users.');
          setIsLoading(false);
        });

        const memoriesRef = ref(db, `users/${user.uid}/memories`);
        unsubscribeMemories = onValue(memoriesRef, (snap) => {
          const fetched: Memory[] = [];
          snap.forEach((child) => {
            fetched.push({ ...(child.val() as Memory), id: child.key || '' });
          });
          setMemories(fetched);
        }, (error) => {
          console.error(error);
          setDbError('Database access denied. Update Firebase Realtime Database rules to allow authenticated users.');
          setIsLoading(false);
        });

        const historyQuery = query(
          ref(db, `users/${user.uid}/history`),
          orderByChild('timestamp'),
          limitToLast(50)
        );
        unsubscribeHistory = onValue(historyQuery, (snap) => {
          const fetched: ChatMessage[] = [];
          snap.forEach((child) => {
            fetched.push({ ...(child.val() as ChatMessage), id: child.key || '' });
          });
          setHistory(fetched);
        }, (error) => {
          console.error(error);
          setDbError('Database access denied. Update Firebase Realtime Database rules to allow authenticated users.');
          setIsLoading(false);
        });
      } else {
        setCurrentUser(null);
        setMemories([]);
        setHistory([]);
        setCurrentView(AppView.AUTH);
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUser();
      unsubscribeMemories();
      unsubscribeHistory();
    };
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const theme = currentView === AppView.ONBOARDING
      ? THEMES.beige
      : THEMES[currentUser.themeColor || 'rose'];

    document.documentElement.style.setProperty('--app-accent', theme.accent);
    document.documentElement.style.setProperty('--app-accent-deep', theme.deep);
    document.documentElement.style.setProperty('--app-accent-light', theme.light);
    document.documentElement.style.setProperty('--app-bg', theme.bg);
  }, [currentUser, currentView]);

  const handleLogout = async () => {
    await auth.signOut();
  };

  const handleCompleteOnboarding = async (prefs: string[], themeColor: ThemeOption) => {
    if (currentUser) {
      const updated = { ...currentUser, preferences: prefs, themeColor, isOnboarded: true };
      await set(ref(db, `users/${currentUser.id}`), updated);
      setCurrentView(AppView.DASHBOARD);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#faf7f7]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-accent-light border-t-accent rounded-full animate-spin mb-6"></div>
          <p className="text-stone-900 font-black tracking-wide text-xl">Entering your mind palace...</p>
        </div>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#faf7f7] p-6">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 shadow-xl border border-stone-100 text-center space-y-4">
          <h2 className="text-2xl font-black text-stone-900">Database access blocked</h2>
          <p className="text-stone-700 font-medium">{dbError}</p>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-accent text-white font-bold rounded-2xl shadow-md hover:brightness-110 transition-all"
          >
            Log out
          </button>
        </div>
      </div>
    );
  }

  if (currentView === AppView.AUTH) {
    return <Auth />;
  }

  if (currentView === AppView.ONBOARDING) {
    return <Onboarding user={currentUser!} onComplete={handleCompleteOnboarding} />;
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return (
          <Dashboard
            memories={memories}
            history={history}
            onChatClick={() => setCurrentView(AppView.CHAT)}
            user={currentUser!}
          />
        );
      case AppView.MIND_VAULT:
        return (
          <MindVault
            user={currentUser!}
            onOpenChat={() => setCurrentView(AppView.CHAT)}
          />
        );
      case AppView.FLOW:
        return (
          <Flow
            user={currentUser!}
            memories={memories}
            history={history}
          />
        );
      case AppView.CHAT:
        return <ChatInterface history={history} user={currentUser!} memories={memories} />;
      case AppView.SETTINGS:
        return <Settings user={currentUser!} setUser={async (u) => {
          if (u) await set(ref(db, `users/${u.id}`), u);
        }} onLogout={handleLogout} />;
      default:
        return (
          <Dashboard
            memories={memories}
            history={history}
            onChatClick={() => setCurrentView(AppView.CHAT)}
            user={currentUser!}
          />
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentView={currentView} setView={setCurrentView} user={currentUser} />
      <main className="flex-1 overflow-y-auto relative">
        <div className="h-full bg-white md:m-3 lg:m-5 md:rounded-[2.5rem] lg:rounded-[3.5rem] md:shadow-2xl md:shadow-stone-200/40 md:border md:border-stone-100 overflow-y-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
