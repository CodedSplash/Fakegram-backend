// Версия новых пользователей и токенов, выданных без claim "tv"
// (до появления версионирования) — такие токены живут до истечения срока
export const INITIAL_TOKEN_VERSION = 0;

export interface UserSessionState {
  tokenVersion: number;
  isActive: boolean;
}
