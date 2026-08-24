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
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: isMobile ? '20px' : '32px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '16px', color: '#1a202c' }}>
          {isLogin ? '🔐 ورود' : '📝 ثبت‌نام'}
        </h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="نام کامل"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                required
              />
              <input
                type="email"
                placeholder="ایمیل"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                required
              />
              <input
                type="tel"
                placeholder="شماره تلفن"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={inputStyle}
                required
              />
            </>
          )}
          {isLogin && (
            <input
              type="text"
              placeholder="نام، ایمیل یا تلفن"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
          )}
          <input
            type="password"
            placeholder="رمز عبور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
          />
          {error && <p style={{ color: '#e53e3e', fontSize: '0.9rem', marginTop: '8px' }}>{error}</p>}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              background: '#4299e1',
              color: 'white',
              border: 'none',
              borderRadius: '40px',
              fontWeight: '700',
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: '12px',
              transition: 'all 0.3s'
            }}
            disabled={loading}
          >
            {loading ? '⏳ ...' : (isLogin ? 'ورود' : 'ثبت‌نام')}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '16px', color: '#4a5568' }}>
          {isLogin ? 'حساب ندارید؟' : 'حساب دارید؟'}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#4299e1',
              fontWeight: '600',
              cursor: 'pointer',
              marginRight: '4px'
            }}
          >
            {isLogin ? 'ثبت‌نام کنید' : 'وارد شوید'}
          </button>
        </p>
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#a0aec0', marginTop: '12px' }}>
          با ثبت‌نام ۱۰ اعتبار رایگان دریافت می‌کنید 🎁
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  marginBottom: '10px',
  borderRadius: '12px',
  border: '2px solid #e2e8f0',
  fontSize: '1rem',
  transition: 'border 0.2s',
  background: '#f7fafc'
};
