export function remove<T>(items: T[], item: T): void {
  const indexOfItem = items.indexOf(item);
  if (indexOfItem === -1) {
    return;
  }
  items.splice(indexOfItem, 1);
}

export function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export default {
  remove,
  pick,
};
