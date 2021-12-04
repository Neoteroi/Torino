let _id = -1;

export function uniqueId(name?: string): string {
  _id++;
  return (name || "id") + _id;
}
