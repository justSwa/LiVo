import React, { useState } from 'react';
import { auth, googleProvider } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import LiVoLogo from './logo';

const Auth: React.FC = () => {
  const [isEnroll, setIsEnroll] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const SUPPORT_EMAIL = "support.livo@gmail.com";
  const DEFAULT_BG = '#8b7355'; // Warm dark beige

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEnroll) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'auth/email-already-in-use') {
        setIsEnroll(false);
        setError('Email already exists. Please log in.');
      } else if (err?.code === 'auth/wrong-password' || err?.code === 'auth/user-not-found') {
        setError('Invalid email or password.');
      } else if (err?.code === 'auth/invalid-credential') {
        setError('Invalid credentials. Please check your email and password.');
      } else {
        setError(err?.message || "An error occurred during authentication.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google Sign-In successful:', result.user);
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Please try again.');
      } else if (err?.code === 'auth/popup-blocked') {
        setError('Pop-up was blocked by your browser. Please allow pop-ups and try again.');
      } else if (err?.code === 'auth/cancelled-popup-request') {
        setError('Sign-in was cancelled. Please try again.');
      } else {
        setError(err?.message || 'An error occurred during Google sign-in.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Email Verification Screen
  if (verificationSent) {
    return (
      <div className="min-h-screen bg-[#f7f3ed] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md backdrop-blur-sm rounded-[3rem] shadow-xl p-10 border border-stone-100/50 bg-white/90">
          <div className="text-center">
            <LiVoLogo size={80} color={DEFAULT_BG} className="mx-auto mb-6" />
            
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h2 className="text-3xl font-bold text-stone-900 mb-4">Check Your Email</h2>
            <p className="text-stone-700 mb-6 leading-relaxed">
              We've sent a verification link to <strong>{email}</strong>
            </p>
            <p className="text-stone-600 text-sm mb-8">
              Please click the link in the email to verify your account, then return here to log in.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setVerificationSent(false);
                  setIsEnroll(false);
                  setEmail('');
                  setPassword('');
                }}
                className="w-full py-4 bg-[#8b7355] text-white font-bold rounded-2xl shadow-lg hover:brightness-110 transition-all"
              >
                Go to Login
              </button>

              <button
                onClick={async () => {
                  try {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    await sendEmailVerification(userCredential.user);
                    await signOut(auth);
                    alert('Verification email sent again!');
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="w-full py-3 text-stone-600 text-sm font-medium hover:text-[#8b7355] transition-colors"
              >
                Didn't receive the email? Resend
              </button>
            </div>
          </div>

          <p className="mt-8 text-xs text-stone-400 text-center">
            Check your spam folder if you don't see the email within a few minutes.
          </p>
        </div>
      </div>
    );
  }

  // Login/Signup Screen
  return (
    <div className="min-h-screen bg-[#f7f3ed] flex flex-col items-center justify-center p-6">
      <div className={`w-full max-w-md backdrop-blur-sm rounded-[3rem] shadow-xl p-10 border border-stone-100/50 ${isEnroll ? 'bg-[#f7f3ed]/90' : 'bg-white/80'}`}>
        <div className="text-center mb-10">
          {/* Customizable Logo */}
          <LiVoLogo size={80} color={DEFAULT_BG} className="mx-auto mb-6 transform -rotate-6 transition-transform hover:rotate-0" />
          
          <h1 className="text-4xl font-light text-stone-800 mb-2 tracking-tight">LiVo</h1>
          <p className="text-stone-600 font-medium text-lg">A calmer way to live</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-500 text-xs font-bold rounded-2xl border border-red-100 animate-fadeIn">
            {error}
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          type="button"
          className="w-full mb-6 py-4 bg-white border-2 border-stone-200 text-stone-700 font-bold rounded-2xl shadow-md hover:shadow-lg hover:border-stone-300 transform hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white/80 px-4 text-stone-400 font-bold tracking-widest">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isEnroll && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">What is your name?</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-6 py-4 bg-white/50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b7355] transition-all placeholder:text-stone-300"
                placeholder="Name"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-white/50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b7355] transition-all placeholder:text-stone-300"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Secret Key (Password)</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-white/50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b7355] transition-all placeholder:text-stone-300"
                placeholder="••••••••"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3-11-7 1.02-2.1 2.8-3.86 4.94-4.94" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M1 1l22 22" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1.05 12C2.73 7 7 4 12 4c5 0 9.27 3 10.95 8-1.68 5-6.95 8-10.95 8-5 0-9.27-3-10.95-8z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: DEFAULT_BG }}
            className="w-full py-4 text-white font-bold rounded-2xl shadow-lg hover:brightness-105 transform hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isEnroll ? 'Join the Flow' : 'Begin')}
          </button>
        </form>

        <div className="mt-10 text-center space-y-4">
          <button
            onClick={() => setIsEnroll(!isEnroll)}
            className="block w-full text-stone-400 text-sm font-medium hover:text-[#8b7355] transition-colors"
          >
            {isEnroll ? 'Already breathing with us? Log In' : "New to LiVo? Enroll for peace"}
          </button>
          
          <a 
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-block text-[10px] text-stone-300 font-black uppercase tracking-[0.2em] hover:text-[#8b7355] transition-colors"
          >
            Need Help? Contact Support
          </a>
        </div>
      </div>
      
      <p className="mt-8 text-stone-400 text-xs max-w-xs text-center leading-relaxed font-medium">
        Your data is treated with total privacy, stored in your personal tranquil vault powered by LiVo Cloud.
      </p>
    </div>
  );
};

export default Auth;