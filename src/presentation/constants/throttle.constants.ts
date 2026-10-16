// Подписка/отписка, запросы на подписку и блокировки — пишущие операции
// (часть с событием в Kafka), лимит строже общего.
export const FOLLOW_WRITE_THROTTLE = {
  short: { limit: 2, ttl: 1000 },
  medium: { limit: 10, ttl: 10000 },
  long: { limit: 30, ttl: 60000 },
};
