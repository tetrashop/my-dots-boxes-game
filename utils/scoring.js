/**
 * سیستم امتیازدهی، پاداش و جریمه
 * - هر مربع: 1 امتیاز پایه
 * - پاداش مربع‌های پشت سر هم (کمبو): +50% در 3 مربع، +100% در 5 مربع
 * - پاداش برد: +10 امتیاز
 * - جریمه باخت: 0
 * - پاداش تساوی: +3
 * - جریمه حرکت نامعتبر: 0 (فقط نوبت از دست می‌رود)
 */

export const REWARDS = {
  BOX: 1,
  WIN: 10,
  DRAW: 3,
  LOSS: 0,
  COMBO_3_BONUS: 0.5,
  COMBO_5_BONUS: 1.0,
  PERFECT_GAME: 5, // اگر حریف صفر امتیاز بگیرد
};

export function calculateReward({
  boxesMade = 0,
  isWinner = false,
  isDraw = false,
  isPerfect = false,
  comboCount = 0,
}) {
  let total = boxesMade * REWARDS.BOX;

  // پاداش کمبو
  if (comboCount >= 5) {
    total += Math.floor(boxesMade * REWARDS.COMBO_5_BONUS);
  } else if (comboCount >= 3) {
    total += Math.floor(boxesMade * REWARDS.COMBO_3_BONUS);
  }

  // پاداش/جریمه پایان بازی
  if (isWinner) total += REWARDS.WIN;
  else if (isDraw) total += REWARDS.DRAW;

  // پاداش بازی بی‌نقص
  if (isPerfect) total += REWARDS.PERFECT_GAME;

  return Math.max(0, total);
}

export function getScoreLevel(score) {
  if (score >= 500) return { level: '🏆 افسانه', color: '#f59e0b' };
  if (score >= 200) return { level: '⭐ استاد', color: '#a855f7' };
  if (score >= 100) return { level: '💎 حرفه‌ای', color: '#06b6d4' };
  if (score >= 50) return { level: '🔥 ماهر', color: '#10b981' };
  if (score >= 20) return { level: '👍 مبتدی', color: '#6366f1' };
  return { level: '🌱 تازه‌کار', color: '#94a3b8' };
}
