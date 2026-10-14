// Notificações desativadas no Expo Go (SDK 53)
// Vão funcionar apenas no build de produção

export interface NotifSettings {
  enabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  streakAlertEnabled: boolean;
}

const DEFAULT_SETTINGS: NotifSettings = {
  enabled: true,
  reminderHour: 17,
  reminderMinute: 0,
  streakAlertEnabled: true,
};

export async function getNotifSettings(): Promise<NotifSettings> {
  return DEFAULT_SETTINGS;
}

export async function saveNotifSettings(_settings: NotifSettings): Promise<void> {
  console.log('[Notificações] Expo Go - ignorado');
}

export async function requestNotifPermission(): Promise<boolean> {
  console.log('[Notificações] Expo Go - ignorado');
  return false;
}

export async function initNotifications(): Promise<void> {
  console.log('[Notificações] Expo Go - ignorado');
}

export async function cancelTodayStreakAlert(): Promise<void> {
  console.log('[Notificações] Expo Go - ignorado');
}

export async function scheduleAllNotifications(): Promise<void> {
  console.log('[Notificações] Expo Go - ignorado');
}

export async function sendAchievementNotification(
  _name: string, _icon: string, _xp: number
): Promise<void> {
  console.log('[Notificações] Expo Go - ignorado');
}
