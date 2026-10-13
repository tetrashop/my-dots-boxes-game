/**
 * مدیریت کاربر با localStorage (SSR-safe)
 */

const STORAGE_KEY = 'dab_users';
const SESSION_KEY = 'dab_session';

function getStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readUsers() {
  const s = getStorage();
  if (!s) return [];
  try {
    const data = s.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  const s = getStorage();
  if (!s) return;
  try {
    s.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch {}
}

export const auth = {
  register({ name, email, phone, password }) {
    if (!name || !email || !password) {
      return { success: false, error: 'همه فیلدها الزامی است' };
    }

    const users = readUsers();
    const exists = users.some(
      (u) => u.email === email || (phone && u.phone === phone)
    );
    if (exists) {
      return { success: false, error: 'ایمیل یا تلفن قبلاً ثبت شده' };
    }

    const user = {
      id: 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || '').trim(),
      password, // در production باید hash شود
      balance: 100, // اعتبار اولیه
      score: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      boxes: 0,
      gamesPlayed: 0,
      lastBonus: null,
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    writeUsers(users);

    const s = getStorage();
    if (s) s.setItem(SESSION_KEY, user.id);

    return { success: true, user };
  },

  login({ identifier, password }) {
    if (!identifier || !password) {
      return { success: false, error: 'اطلاعات ورود ناقص' };
    }

    const users = readUsers();
    const id = identifier.trim().toLowerCase();
    const user = users.find(
      (u) =>
        u.email === id ||
        u.phone === identifier.trim() ||
        u.name === identifier.trim()
    );

    if (!user || user.password !== password) {
      return { success: false, error: 'اطلاعات ورود نامعتبر' };
    }

    const s = getStorage();
    if (s) s.setItem(SESSION_KEY, user.id);

    return { success: true, user };
  },

  logout() {
    const s = getStorage();
    if (s) s.removeItem(SESSION_KEY);
  },

  getCurrentUser() {
    const s = getStorage();
    if (!s) return null;
    const id = s.getItem(SESSION_KEY);
    if (!id) return null;
    return readUsers().find((u) => u.id === id) || null;
  },

  updateUser(id, updates) {
    const users = readUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    writeUsers(users);
    return users[idx];
  },

  getLeaderboard(limit = 10) {
    return readUsers()
      .sort((a, b) => b.score - a.score || b.wins - a.wins)
      .slice(0, limit);
  },

  claimDailyBonus(id) {
    const user = this.getCurrentUser();
    if (!user || user.id !== id) return { success: false, error: 'کاربر یافت نشد' };

    const today = new Date().toDateString();
    if (user.lastBonus === today) {
      return { success: false, error: 'امروز جایزه گرفته‌اید' };
    }

    const bonus = 25;
    const updated = this.updateUser(id, {
      balance: user.balance + bonus,
      lastBonus: today,
    });

    return { success: true, bonus, user: updated };
  },

  addGameResult(id, { boxes, reward, isWinner, isDraw }) {
    const user = readUsers().find((u) => u.id === id);
    if (!user) return null;

    const updates = {
      score: user.score + reward,
      boxes: user.boxes + boxes,
      gamesPlayed: user.gamesPlayed + 1,
      wins: user.wins + (isWinner ? 1 : 0),
      losses: user.losses + (!isWinner && !isDraw ? 1 : 0),
      draws: user.draws + (isDraw ? 1 : 0),
    };

    return this.updateUser(id, updates);
  },
};
