import { useState } from 'react';
import { auth } from '../utils/auth';

export default function AuthModal({ onLogin, isMobile }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const result = auth.login(email || phone || name, password);
      if (result.success) {
        onLogin(result.user);
      } else {
        setError(result.error);
      }
    } else {
      if (!name || !email || !phone || !password) {
        setError('لطفاً همه فیلدها را پر کنید');
        setLoading(false);
        return;
      }
      const result = auth.register(name, email, phone, password);
      if (result.success) {
        onLogin(result.user);
      } else {
        setError(result.error);
      }
    }
    setLoading(false);
  };

  return (
    <div className="card" style={{ maxWidth: '420px', margin: '0 auto' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '16px', color: '#A29BFE' }}>
        {isLogin ? '🔐 ورود' : '📝 ثبت‌نام'}
      </h3>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <input type="text" placeholder="نام کامل" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: '10px' }} required />
            <input type="email" placeholder="ایمیل" value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginBottom: '10px' }} required />
            <input type="tel" placeholder="شماره تلفن" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ marginBottom: '10px' }} required />
          </>
        )}
        {isLogin && (
          <input type="text" placeholder="نام، ایمیل یا تلفن" value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginBottom: '10px' }} required />
        )}
        <input type="password" placeholder="رمز عبور" value={password} onChange={(e) => setPassword(e.target.value)} style={{ marginBottom: '10px' }} required />
        {error && <p style={{ color: '#FF6B6B', fontSize: '0.9rem', marginBottom: '8px' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: '12px', fontSize: '1rem' }} disabled={loading}>
          {loading ? '⏳ ...' : (isLogin ? 'ورود' : 'ثبت‌نام')}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '16px', color: 'rgba(255,255,255,0.6)' }}>
        {isLogin ? 'حساب ندارید؟' : 'حساب دارید؟'}
        <button onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{ background: 'none', border: 'none', color: '#A29BFE', fontWeight: '600', cursor: 'pointer', marginRight: '4px', padding: '4px 8px' }}>
          {isLogin ? 'ثبت‌نام کنید' : 'وارد شوید'}
        </button>
      </p>
      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginTop: '12px' }}>
        🎁 با ثبت‌نام ۱۰ اعتبار رایگان دریافت کنید
      </p>
    </div>
  );
}
