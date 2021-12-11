export function storeOption(key: string, value: string): void {
  localStorage.setItem(key, value);
}

export function readStoredOption<T>(
  key: string,
  fn: (value: string) => T,
  defaultValue: T
): T {
  const storedValue = localStorage.getItem(key);

  if (!storedValue) {
    return defaultValue;
  }

  return fn(storedValue);
}
