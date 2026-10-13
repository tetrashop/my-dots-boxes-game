import { useState } from 'react';
import { auth } from '../utils/auth';

export default function AuthModal({ onSuccess }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let result;
    if (mode === 'login') {
      result = auth.login({
        identifier: form.email || form.phone || form.name,
        password: form.password,
      });
    } else {
      result = auth.register(form);
    }

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onSuccess(result.user);
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: 12 }}>
        {mode === 'login' ? '🔐 ورود' : '📝 ثبت‌نام'}
      </h3>

      <form onSubmit={submit}>
        {mode === 'register' && (
          <>
            <label>نام کامل</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="مثال: رامین اجلال"
              required
              style={{ marginBottom: 10 }}
            />
            <label>شماره تلفن</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="09xxxxxxxxx"
              style={{ marginBottom: 10 }}
            />
          </>
        )}

        <label>{mode === 'login' ? 'نام، ایمیل یا تلفن' : 'ایمیل'}</label>
        <input
          type={mode === 'login' ? 'text' : 'email'}
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="example@email.com"
          required
          style={{ marginBottom: 10 }}
        />

        <label>رمز عبور</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          placeholder="••••••"
          required
          style={{ marginBottom: 10 }}
        />

        {error && <div className="alert alert-danger">{error}</div>}

        <button type="submit" disabled={loading} style={{ width: '100%', marginTop: 12 }}>
          {loading ? '⏳ ...' : mode === 'login' ? 'ورود' : 'ثبت‌نام'}
        </button>
      </form>

      <div className="center" style={{ marginTop: 12 }}>
        <button
          className="ghost"
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
        >
          {mode === 'login' ? 'حساب ندارید؟ ثبت‌نام' : 'حساب دارید؟ ورود'}
        </button>
      </div>

      <p className="center muted" style={{ marginTop: 10 }}>
        🎁 با ثبت‌نام ۱۰۰ اعتبار رایگان دریافت کنید
      </p>
    </div>
  );
}
