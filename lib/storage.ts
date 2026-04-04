import config from "../school.config";

export function storageKey(key: string): string {
  return `${config.storagePrefix}-${key}`;
}
