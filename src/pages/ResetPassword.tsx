import { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, KeyRound } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/admin/login'), 2000);
    }
  };

  if (!isRecovery) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center">
          <p className="text-muted-foreground">Invalid or expired reset link.</p>
          <button onClick={() => navigate('/admin/login')} className="mt-4 text-sm text-primary underline">
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Set New Password</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your new password below</p>
        </div>

        {success ? (
          <div className="bg-card border border-border rounded-lg p-6 shadow-xs text-center">
            <p className="text-sm text-green-600 font-medium">Password updated successfully! Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 shadow-xs space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
              />
            </div>

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
                <KeyRound className="h-4 w-4" />
                {loading ? 'Updating...' : 'Update Password'}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
