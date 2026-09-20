import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { animate, stagger } from 'animejs';
import { 
  Compass, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Lock,
  RefreshCw,
  User,
  AtSign
} from 'lucide-react';
import { loginApi, registerApi, forgotPasswordApi, resetPasswordWithOtpApi } from '../services/api';

interface ParallaxMapLoginProps {
  onLogin: (email: string, name: string) => void;
  defaultEmail?: string;
}

export const ParallaxMapLogin: React.FC<ParallaxMapLoginProps> = ({ onLogin, defaultEmail = '' }) => {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD'>('LOGIN');
  const [email, setEmail] = useState(defaultEmail);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password flow state
  const [forgotStep, setForgotStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [otpSentNotice, setOtpSentNotice] = useState<string | null>(null);

  // Status and feedback indicators
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset messages when changing auth mode
  const switchMode = (mode: 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD') => {
    setAuthMode(mode);
    setErrorMessage(null);
    setSuccessMessage(null);
    if (mode === 'FORGOT_PASSWORD') {
      setForgotStep('EMAIL');
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
      setOtpSentNotice(null);
    }
  };

  // Anime.js continuous live floating animation for background elements
  useEffect(() => {
    const animOrbs = animate('.login-live-orb', {
      translateX: [-30, 40, -10],
      translateY: [-20, 30, -15],
      scale: [1, 1.15, 0.95],
      duration: 12000,
      ease: 'inOutSine',
      loop: true,
      alternate: true
    });

    const animPins = animate('.login-floating-pin', {
      translateY: [-8, 8],
      duration: 3500,
      delay: stagger(400),
      ease: 'inOutQuad',
      loop: true,
      alternate: true
    });

    return () => {
      animOrbs.revert();
      animPins.revert();
    };
  }, []);

  // Mouse parallax motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Parallax offsets
  const mapTranslateX = useTransform(smoothX, [-0.5, 0.5], [-35, 35]);
  const mapTranslateY = useTransform(smoothY, [-0.5, 0.5], [-35, 35]);
  const pinsTranslateX = useTransform(smoothX, [-0.5, 0.5], [-60, 60]);
  const pinsTranslateY = useTransform(smoothY, [-0.5, 0.5], [-60, 60]);
  const cardRotateX = useTransform(smoothY, [-0.5, 0.5], [6, -6]);
  const cardRotateY = useTransform(smoothX, [-0.5, 0.5], [-6, 6]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientWidth, clientHeight } = e.currentTarget;
    const xPct = e.clientX / clientWidth - 0.5;
    const yPct = e.clientY / clientHeight - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  // Submit Login or Sign Up
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanIdentifier = email.trim();
    if (!cleanIdentifier) {
      setErrorMessage(authMode === 'LOGIN' ? 'Please enter your email or @username.' : 'Please enter your email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password / access key.');
      return;
    }

    setIsLoading(true);

    if (authMode === 'LOGIN') {
      try {
        const result = await loginApi({ identifier: cleanIdentifier, email: cleanIdentifier, password });
        if (result.success) {
          setSuccessMessage('Authentication verified! Launching Trip OS...');
          const resolvedName = result.user?.profile?.name || result.user?.user_metadata?.name || result.user?.name || 'EXPLORER';
          const resolvedEmail = result.user?.email || (cleanIdentifier.includes('@') ? cleanIdentifier : `${cleanIdentifier}@tripos.world`);
          setTimeout(() => {
            onLogin(resolvedEmail, resolvedName);
          }, 600);
        } else {
          setErrorMessage(result.message || 'Invalid credentials or connection error');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Login failed. Please check your credentials.');
      } finally {
        setIsLoading(false);
      }
    } else if (authMode === 'SIGNUP') {
      const cleanName = name.trim() || 'EXPLORER';
      const cleanUsername = username.trim().toLowerCase().replace('@', '').replace(/[^a-z0-9_]/g, '');

      if (!cleanUsername) {
        setErrorMessage('Please choose a unique explorer @username (alphanumeric).');
        setIsLoading(false);
        return;
      }

      if (!cleanIdentifier.includes('@')) {
        setErrorMessage('Please provide a valid email address for account verification.');
        setIsLoading(false);
        return;
      }

      try {
        const regResult = await registerApi({ 
          name: cleanName, 
          username: cleanUsername,
          email: cleanIdentifier, 
          password 
        });
        if (regResult.success) {
          setSuccessMessage('Account created successfully! Logging you in...');
          const loginResult = await loginApi({ identifier: cleanUsername, email: cleanIdentifier, password });
          if (loginResult.success) {
            setTimeout(() => {
              onLogin(cleanIdentifier, cleanName);
            }, 600);
          } else {
            setTimeout(() => {
              onLogin(cleanIdentifier, cleanName);
            }, 800);
          }
        } else {
          setErrorMessage(regResult.message || 'Registration failed. Try a different email or username.');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to create account.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Forgot Password: Step 1 - Send OTP to Real Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid registered email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await forgotPasswordApi(cleanEmail);
      if (res.success) {
        setForgotStep('OTP');
        setOtpSentNotice(`Real 6-digit OTP dispatched to ${cleanEmail}. Please check your inbox or spam folder.`);
        setSuccessMessage('OTP code sent successfully 📩');
      } else {
        setErrorMessage(res.message || 'Failed to send OTP. Please verify your email.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to connect to recovery service.');
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password: Step 2 - Verify OTP & Set New Password
  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!otpCode || otpCode.trim().length < 4) {
      setErrorMessage('Please enter the 6-digit OTP received in your email.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPasswordWithOtpApi({
        email: email.trim(),
        otp: otpCode.trim(),
        newPassword
      });

      if (res.success) {
        setSuccessMessage('Password reset successfully! Redirecting to login with your new password...');
        setPassword(newPassword);
        setTimeout(() => {
          switchMode('LOGIN');
          setSuccessMessage('Password updated! Enter your new credentials to log in.');
        }, 1500);
      } else {
        setErrorMessage(res.message || 'Invalid or expired OTP code.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      id="login-parallax-container"
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100/80 p-4 select-none"
    >
      {/* Dynamic Background Living Ambient Light Spheres (Anime.js) */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="login-live-orb absolute -top-20 -left-20 w-[450px] h-[450px] rounded-full bg-orange-400/25 blur-[100px]" />
        <div className="login-live-orb absolute -bottom-24 -right-24 w-[500px] h-[500px] rounded-full bg-sky-400/25 blur-[120px]" />
        <div className="login-live-orb absolute top-1/3 right-1/4 w-[350px] h-[350px] rounded-full bg-emerald-400/20 blur-[90px]" />
      </div>

      {/* Dynamic Parallax Interactive Map Background */}
      <motion.div 
        style={{ x: mapTranslateX, y: mapTranslateY }}
        className="absolute inset-[-60px] pointer-events-none opacity-30"
      >
        {/* Topographic Contour lines & India Map Silhouette */}
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.4" />
              <circle cx="30" cy="30" r="1.5" fill="#64748b" opacity="0.25" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          
          {/* Organic Topographic elevation curves */}
          <path 
            d="M 50 150 Q 300 80 600 220 T 1200 180 T 1800 280" 
            fill="none" 
            stroke="#f97316" 
            strokeWidth="1.5" 
            opacity="0.3" 
          />
          <path 
            d="M 0 350 Q 400 220 850 420 T 1600 360 T 2100 480" 
            fill="none" 
            stroke="#10b981" 
            strokeWidth="1.2" 
            opacity="0.25" 
          />
          <path 
            d="M 100 600 Q 550 480 980 680 T 1750 560" 
            fill="none" 
            stroke="#0284c7" 
            strokeWidth="1.5" 
            opacity="0.25" 
          />
        </svg>
      </motion.div>

      {/* Floating Parallax Destination Pins */}
      <motion.div 
        style={{ x: pinsTranslateX, y: pinsTranslateY }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="login-floating-pin absolute top-[18%] left-[22%] flex items-center gap-2 bg-white/80 backdrop-blur-xl px-3.5 py-1.5 rounded-full shadow-xs border border-slate-200/80">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          <span className="text-xs font-bold tracking-wider text-slate-900 uppercase">JAIPUR • 28°C</span>
        </div>

        <div className="login-floating-pin absolute top-[32%] right-[18%] flex items-center gap-2 bg-white/80 backdrop-blur-xl px-3.5 py-1.5 rounded-full shadow-xs border border-slate-200/80">
          <span className="w-2 h-2 rounded-full bg-sky-500"></span>
          <span className="text-xs font-bold tracking-wider text-slate-900 uppercase">MANALI • -2°C ❄️</span>
        </div>

        <div className="login-floating-pin absolute bottom-[24%] left-[16%] flex items-center gap-2 bg-white/80 backdrop-blur-xl px-3.5 py-1.5 rounded-full shadow-xs border border-slate-200/80">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span className="text-xs font-bold tracking-wider text-slate-900 uppercase">GOA BEACHES • 31°C ☀️</span>
        </div>

        <div className="login-floating-pin absolute bottom-[20%] right-[24%] flex items-center gap-2 bg-white/80 backdrop-blur-xl px-3.5 py-1.5 rounded-full shadow-xs border border-slate-200/80">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-xs font-bold tracking-wider text-slate-900 uppercase">MUNNAR TEA HILLS • 19°C 🍃</span>
        </div>
      </motion.div>

      {/* Center Soft Glass Login Card with Subtle Parallax Tilt */}
      <motion.div
        id="login-glass-card"
        style={{ rotateX: cardRotateX, rotateY: cardRotateY, transformPerspective: 1000 }}
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 140 }}
        className="relative z-10 w-full max-w-md p-6 sm:p-8 glass-card border border-white/90 shadow-[0_24px_50px_rgba(15,23,42,0.08)]"
      >
        {/* Top Badge */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 px-3 py-1 glass-pill text-slate-800 font-bold text-xs tracking-wider">
            <Compass className="w-3.5 h-3.5 text-orange-500 animate-spin" style={{ animationDuration: '16s' }} />
            <span>REALTIME DATABASE AUTH</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SECURE VAULT</span>
          </div>
        </div>

        {/* Title */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 p-1 flex items-center justify-center text-white shadow-xs ring-1 ring-slate-200 overflow-hidden">
              <img src="/logo.png" alt="TRIP OS Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-orange-600">TRIP OS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 leading-none mb-1.5">
            {authMode === 'FORGOT_PASSWORD' ? 'PASSWORD RECOVERY' : 'TRIP OS VAULT'}
          </h1>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            {authMode === 'FORGOT_PASSWORD'
              ? 'DISPATCH REALTIME OTP TO REGISTERED EMAIL'
              : 'EXPLORE DESTINATIONS • GROUPDNA™ • DISASTER RADAR'}
          </p>
        </div>

        {/* Feedback Alert Banners */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs font-bold text-rose-800"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs font-bold text-emerald-800"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">{successMessage}</div>
          </motion.div>
        )}

        {/* Form View: LOGIN / SIGNUP vs FORGOT PASSWORD */}
        {authMode !== 'FORGOT_PASSWORD' ? (
          <>
            {/* Login vs Sign Up Tab Switcher */}
            <div className="flex rounded-2xl bg-slate-100/80 p-1 mb-5 border border-slate-200/60">
              <button
                type="button"
                onClick={() => switchMode('LOGIN')}
                className={`flex-1 py-2 text-xs font-mono font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  authMode === 'LOGIN'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                LOGIN
              </button>
              <button
                type="button"
                onClick={() => switchMode('SIGNUP')}
                className={`flex-1 py-2 text-xs font-mono font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  authMode === 'SIGNUP'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                CREATE ACCOUNT
              </button>
            </div>

            {/* Login / Sign Up Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {authMode === 'SIGNUP' && (
                <>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-1"
                  >
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      FULL NAME *
                    </label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. ALEX MORGAN"
                        required={authMode === 'SIGNUP'}
                        className="w-full px-4 py-3 glass-input text-slate-900 font-bold uppercase tracking-wide text-sm placeholder:text-slate-400 pl-10"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-1"
                  >
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      CHOOSE EXPLORER USERNAME *
                    </label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder="e.g. pilot_ansh"
                        required={authMode === 'SIGNUP'}
                        className="w-full px-4 py-3 glass-input text-slate-900 font-bold tracking-wide text-sm placeholder:text-slate-400 pl-10 font-mono"
                      />
                      <AtSign className="w-4 h-4 text-orange-500 absolute left-3.5 top-3.5 pointer-events-none" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 block">
                      Used by friends & leaders to invite you to trips.
                    </span>
                  </motion.div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  {authMode === 'LOGIN' ? 'EMAIL ADDRESS OR @USERNAME *' : 'TRAVEL EMAIL ADDRESS *'}
                </label>
                <div className="relative">
                  <input 
                    type={authMode === 'LOGIN' ? 'text' : 'email'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={authMode === 'LOGIN' ? 'e.g. alex@gmail.com or @pilot_ansh' : 'e.g. alex.morgan@gmail.com'}
                    required
                    className="w-full px-4 py-3 glass-input text-slate-900 font-bold tracking-wide text-sm placeholder:text-slate-400 pl-10"
                  />
                  {authMode === 'LOGIN' && !email.includes('@') && email.length > 0 ? (
                    <AtSign className="w-4 h-4 text-orange-500 absolute left-3.5 top-3.5 pointer-events-none" />
                  ) : (
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  )}
                </div>
              </div>

              {/* Password Box for BOTH Login and Signup */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {authMode === 'LOGIN' ? 'PASSWORD / ACCESS KEY *' : 'CHOOSE SECURITY PASSWORD *'}
                  </label>
                  {authMode === 'LOGIN' && (
                    <button
                      type="button"
                      onClick={() => switchMode('FORGOT_PASSWORD')}
                      className="text-[11px] font-mono font-bold text-orange-600 hover:text-orange-500 uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      FORGOT PASSWORD?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={authMode === 'LOGIN' ? 'ENTER YOUR PASSWORD' : 'CREATE STRONG PASSWORD (MIN 6 CHARS)'}
                    required
                    className="w-full px-4 py-3 glass-input text-slate-900 font-bold tracking-wide text-sm placeholder:text-slate-400 pl-10 pr-10"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.01 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 glass-button flex items-center justify-center gap-2.5 text-sm font-bold shadow-md cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                      <span>AUTHENTICATING REALTIME...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-orange-400" />
                      <span>{authMode === 'LOGIN' ? 'ACCESS TRIP OS DASHBOARD' : 'REGISTER & LAUNCH TRIP OS'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => onLogin('guest.explorer@tripos.world', 'GUEST EXPLORER')}
                  className="w-full py-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-100/60 text-slate-500 hover:text-slate-800 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  OR EXPLORE AS GUEST
                </button>
              </div>
            </form>
          </>
        ) : (
          /* FORGOT PASSWORD RECOVERY VIEW */
          <div className="space-y-4">
            {forgotStep === 'EMAIL' ? (
              /* Step 1: Input registered email to receive OTP */
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-200 text-xs text-orange-950 font-medium">
                  Enter your registered travel email address. We will dispatch a real-time 6-digit OTP verification code to reset your password.
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    REGISTERED TRAVEL EMAIL *
                  </label>
                  <div className="relative">
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. explorer@gmail.com"
                      required
                      className="w-full px-4 py-3 glass-input text-slate-900 font-bold tracking-wide text-sm placeholder:text-slate-400 pl-10"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.01 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 glass-button flex items-center justify-center gap-2 text-sm font-bold shadow-md cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                        <span>DISPATCHING REALTIME OTP...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 text-orange-500" />
                        <span>SEND OTP TO EMAIL</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => switchMode('LOGIN')}
                    className="w-full py-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-100/60 text-slate-500 hover:text-slate-800 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>BACK TO LOGIN</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Input 6-digit OTP and New Password */
              <form onSubmit={handleVerifyOtpAndReset} className="space-y-3.5">
                {otpSentNotice && (
                  <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 font-medium">
                    {otpSentNotice}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      ENTER 6-DIGIT OTP CODE *
                    </label>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isLoading}
                      className="text-[11px] font-mono font-bold text-orange-600 hover:text-orange-500 uppercase tracking-wider cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>RESEND</span>
                    </button>
                  </div>
                  <input 
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="e.g. 849201"
                    maxLength={6}
                    required
                    className="w-full px-4 py-3 glass-input text-slate-900 font-mono font-black tracking-widest text-center text-lg placeholder:text-slate-400 placeholder:tracking-normal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    NEW SECURITY PASSWORD *
                  </label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="ENTER NEW STRONG PASSWORD"
                      required
                      className="w-full px-4 py-3 glass-input text-slate-900 font-bold tracking-wide text-sm placeholder:text-slate-400 pl-10 pr-10"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    CONFIRM NEW PASSWORD *
                  </label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="CONFIRM NEW PASSWORD"
                      required
                      className="w-full px-4 py-3 glass-input text-slate-900 font-bold tracking-wide text-sm placeholder:text-slate-400 pl-10"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.01 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 glass-button flex items-center justify-center gap-2 text-sm font-bold shadow-md cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                        <span>VERIFYING OTP & UPDATING PASSWORD...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>VERIFY OTP & RESET PASSWORD</span>
                      </>
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => switchMode('LOGIN')}
                    className="w-full py-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-100/60 text-slate-500 hover:text-slate-800 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>CANCEL & RETURN TO LOGIN</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Fast Instant Demo Badge */}
        <div className="mt-5 pt-3.5 border-t border-slate-200/60 text-center">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            PARALLAX MOTION ENABLED • MOVE CURSOR TO EXPLORE
          </p>
        </div>
      </motion.div>
    </div>
  );
};
