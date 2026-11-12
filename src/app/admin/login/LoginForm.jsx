'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { authClient } from '@/lib/auth-client';

export default function LoginForm() {
  const [email, setEmail] = useState('wemraytechnology@gmail.com');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    if (status === 'submitting') return;

    setStatus('submitting');
    setError('');

    const { error: authError } = await authClient.signIn.magicLink({
      email,
      callbackURL: '/admin',
      errorCallbackURL: '/admin/login?error=1',
    });

    if (authError) {
      setStatus('error');
      setError('We could not send a sign-in link. Please try again shortly.');
      return;
    }

    setStatus('sent');
  };

  if (status === 'sent') {
    return (
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <img src="/logo.png" alt="" />
          WEMRAY
        </div>
        <h1>Check your email.</h1>
        <p>
          If <strong>{email}</strong> has admin access, a sign-in link has been sent.
          The link expires in 10 minutes.
        </p>
        <p className="admin-login-note">
          <Link href="/">Return to the website</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="admin-login-card">
      <div className="admin-login-brand">
        <img src="/logo.png" alt="" />
        WEMRAY
      </div>
      <h1>Admin sign in.</h1>
      <p>Enter the email address approved for Wemray admin access.</p>
      <form className="admin-login-form" onSubmit={submit}>
        <label>
          Email address
          <input
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            placeholder="wemraytechnology@gmail.com"
          />
        </label>
        <Button variant="pur" type="submit">
          {status === 'submitting' ? 'Sending…' : 'Email me a sign-in link'}
        </Button>
      </form>
      {error ? <p className="admin-notice bad">{error}</p> : null}
      <p className="admin-login-note">
        <Link href="/">Return to the website</Link>
      </p>
    </div>
  );
}

