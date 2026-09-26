import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import logo from '@/assets/usk-logo.png.asset.json';

export const Route = createFileRoute('/staff')({
  head: () => ({ meta: [
    { title: 'Staff Sign In | Usk Bar & Grill' },
    { name: 'description', content: 'Staff sign in for Usk Bar & Grill content management.' },
    { property: 'og:title', content: 'Staff Sign In | Usk Bar & Grill' },
    { property: 'og:description', content: 'Staff access for Usk Bar & Grill.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }), component: Staff,
});
function Staff() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'sign-in'|'sign-up'|'reset'>('sign-in');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { supabase.auth.getUser().then(({data}) => { if (data.user) navigate({to:'/manage'}); }); }, [navigate]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError('');
    const fd = new FormData(e.currentTarget); const email = String(fd.get('email')); const password = String(fd.get('password'));
    if (mode === 'reset') { const {error} = await supabase.auth.resetPasswordForEmail(email, {redirectTo:window.location.origin+'/staff'}); setError(error?.message || 'Check your email for a password reset link.'); }
    else if (mode === 'sign-up') { const {error} = await supabase.auth.signUp({email,password}); setError(error?.message || 'Check your email to confirm your account. Staff access must be granted separately.'); }
    else { const {error} = await supabase.auth.signInWithPassword({email,password}); if (error) setError(error.message); else navigate({to:'/manage'}); }
    setBusy(false);
  }
  async function google() { setBusy(true); const result = await lovable.auth.signInWithOAuth('google',{redirect_uri:window.location.origin+'/staff'}); if (result.error) {setError(result.error.message);setBusy(false);} else if (!result.redirected) navigate({to:'/manage'}); }
  return <main className="flex min-h-screen items-center justify-center px-5 py-16"><div className="w-full max-w-sm"><Link to="/" className="mx-auto block w-fit"><img src={logo.url} alt="Usk Bar & Grill" className="h-28 w-28 object-contain"/></Link><h1 className="display-title mt-8 text-center text-3xl">{mode==='sign-in'?'Staff sign in':mode==='sign-up'?'Create an account':'Reset your password'}</h1><p className="mt-3 text-center text-sm text-muted-foreground">Restaurant content management</p><form onSubmit={submit} className="mt-8 space-y-5"><label className="block text-sm">Email<input name="email" type="email" required autoComplete="email" className="mt-2 w-full border border-border bg-card px-4 py-3 outline-none focus:border-primary"/></label>{mode!=='reset' && <label className="block text-sm">Password<input name="password" type="password" required minLength={6} autoComplete={mode==='sign-up'?'new-password':'current-password'} className="mt-2 w-full border border-border bg-card px-4 py-3 outline-none focus:border-primary"/></label>}<Button variant="hero" type="submit" className="h-11 w-full" disabled={busy}>{busy?'Please wait…':mode==='reset'?'Send reset link':mode==='sign-up'?'Create account':'Sign in'}</Button></form>{mode!=='reset' && <Button variant="outline" className="mt-3 h-11 w-full" onClick={google} disabled={busy}>Continue with Google</Button>}{error && <p role="status" className="mt-4 text-sm text-primary">{error}</p>}<div className="mt-6 flex justify-between text-xs text-muted-foreground"><Button variant="link" className="h-auto p-0" onClick={()=>{setError('');setMode(mode==='sign-up'?'sign-in':'sign-up');}}>{mode==='sign-up'?'Sign in':'Create account'}</Button><Button variant="link" className="h-auto p-0" onClick={()=>{setError('');setMode(mode==='reset'?'sign-in':'reset');}}>{mode==='reset'?'Back to sign in':'Forgot password?'}</Button></div><Link to="/" className="mt-10 block text-center text-sm text-muted-foreground hover:text-primary">← Back to the restaurant</Link></div></main>;
}
