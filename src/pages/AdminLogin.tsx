import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from '@/lib/router-compat';
import { Lock, TrendingUp, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { signIn, isAdmin, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // If already logged in as admin, redirect declaratively (no side-effect during render)
  if (!authLoading && user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (forgotMode) {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (resetError) {
        setError(resetError.message);
      } else {
        setResetSent(true);
      }
      return;
    }

    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    // Auth state will update via onAuthStateChange; the Navigate above will redirect
    // once isAdmin resolves. Keep a fallback navigation in case role check is slow.
    setTimeout(() => {
      setLoading(false);
      navigate('/admin', { replace: true });
    }, 800);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <h1 className="font-serif text-2xl font-bold text-foreground">{forgotMode ? 'Reset Password' : 'Admin Login'}</h1>
          <p className="text-sm text-muted-foreground mt-1">{forgotMode ? 'Enter your email to receive a reset link' : 'Sign in to manage IPO data'}</p>
        </div>

        {resetSent ? (
          <div className="bg-card border border-border rounded-lg p-6 shadow-xs text-center space-y-3">
            <p className="text-sm text-foreground font-medium">Reset link sent to {email}</p>
            <p className="text-xs text-muted-foreground">Check your inbox and click the link to set a new password.</p>
            <button onClick={() => { setForgotMode(false); setResetSent(false); }} className="text-sm text-primary underline">
              Back to login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 shadow-xs space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                placeholder="admin@example.com"
              />
            </div>
            {!forgotMode && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                />
              </div>
            )}

            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2">
                <Lock className="h-4 w-4" />
                {loading ? (forgotMode ? 'Sending...' : 'Signing in...') : (forgotMode ? 'Send Reset Link' : 'Sign In')}
              </span>
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setForgotMode(!forgotMode); setError(''); }}
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                {forgotMode && <ArrowLeft className="h-3 w-3" />}
                {forgotMode ? 'Back to login' : 'Forgot password?'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
