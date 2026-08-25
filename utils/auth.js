// سیستم احراز هویت با پشتیبانی از SSR (بدون خطای localStorage)

const getStorage = () => {
  if (typeof window !== 'undefined') return localStorage;
  return null;
};

const getUsers = () => {
  const storage = getStorage();
  if (!storage) return [];
  try { return JSON.parse(storage.getItem('game_auth_data') || '[]'); } catch { return []; }
};

const setUsers = (users) => {
  const storage = getStorage();
  if (storage) storage.setItem('game_auth_data', JSON.stringify(users));
};

export const auth = {
  register: (name, email, phone, password) => {
    const users = getUsers();
    if (users.find(u => u.email === email || u.phone === phone)) {
      return { success: false, error: 'کاربر با این ایمیل یا تلفن وجود دارد' };
    }
    const newUser = {
      id: Date.now().toString(),
      name, email, phone, password,
      balance: 10, score: 0, wins: 0, losses: 0, boxes: 0,
      createdAt: new Date().toISOString(),
      lastDailyBonus: null
    };
    users.push(newUser);
    setUsers(users);
    return { success: true, user: newUser };
  },
  login: (identifier, password) => {
    const users = getUsers();
    const user = users.find(u => (u.email === identifier || u.phone === identifier || u.name === identifier) && u.password === password);
    if (!user) return { success: false, error: 'اطلاعات ورود صحیح نیست' };
    return { success: true, user };
  },
  getUser: (id) => {
    const users = getUsers();
    return users.find(u => u.id === id);
  },
  updateUser: (id, updates) => {
    const users = getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...updates };
    setUsers(users);
    return users[index];
  },
  getAllUsers: () => getUsers(),
  getLeaderboard: () => {
    const users = getUsers();
    return users.sort((a, b) => b.score - a.score || b.balance - a.balance);
  },
  addDailyBonus: (id) => {
    const user = auth.getUser(id);
    if (!user) return null;
    const today = new Date().toDateString();
    if (user.lastDailyBonus === today) {
      return { success: false, error: 'امروز جایزه روزانه دریافت کردید' };
    }
    const bonus = 3;
    const updated = auth.updateUser(id, { balance: user.balance + bonus, lastDailyBonus: today });
    if (!updated) return null;
    return { success: true, bonus, newBalance: updated.balance };
  },
  addScore: (id, points) => {
    const user = auth.getUser(id);
    if (!user) return null;
    return auth.updateUser(id, { score: user.score + points });
  },
  addWin: (id) => {
    const user = auth.getUser(id);
    if (!user) return null;
    return auth.updateUser(id, { wins: user.wins + 1 });
  },
  addLoss: (id) => {
    const user = auth.getUser(id);
    if (!user) return null;
    return auth.updateUser(id, { losses: user.losses + 1 });
  },
  addBoxes: (id, count) => {
    const user = auth.getUser(id);
    if (!user) return null;
    return auth.updateUser(id, { boxes: user.boxes + count });
  }
};
