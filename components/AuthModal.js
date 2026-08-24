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
    <div style={{
      background: 'white',
      borderRadius: '24px',
      padding: isMobile ? '20px' : '28px',
      maxWidth: '420px',
      margin: '0 auto',
      boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
    }}>
      <h3 style={{ textAlign: 'center', marginBottom: '16px', color: '#1a202c' }}>
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
        {error && <p style={{ color: '#e53e3e', fontSize: '0.9rem', marginBottom: '8px' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '40px', background: '#4299e1', color: 'white', fontWeight: '700', fontSize: '1rem', border: 'none', cursor: 'pointer' }} disabled={loading}>
          {loading ? '⏳ ...' : (isLogin ? 'ورود' : 'ثبت‌نام')}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '16px', color: '#4a5568' }}>
        {isLogin ? 'حساب ندارید؟' : 'حساب دارید؟'}
        <button onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{ background: 'none', border: 'none', color: '#4299e1', fontWeight: '600', cursor: 'pointer', marginRight: '4px' }}>
          {isLogin ? 'ثبت‌نام کنید' : 'وارد شوید'}
        </button>
      </p>
      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#a0aec0', marginTop: '12px' }}>
        🎁 با ثبت‌نام ۱۰ اعتبار رایگان دریافت کنید
      </p>
    </div>
  );
}
