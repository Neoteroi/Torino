/**
 * Returns a value indicating whether a node contains another node.
 */
export function contains(a: ChildNode, b: ChildNode): boolean {
  if (!a || !b) return false;
  if (!a.hasChildNodes()) return false;
  const children = a.childNodes,
    l = children.length;
  for (let i = 0; i < l; i++) {
    const child = children[i];
    if (child === b) return true;
    if (contains(child, b)) {
      return true;
    }
  }
  return false;
}

/**
 * Gets the closest ancestor of the given element having the given tagName.
 */
export function closest(
  el: HTMLElement,
  predicate: (parent: HTMLElement) => boolean,
  excludeItself: boolean
): HTMLElement | null {
  if (!el || !predicate) return null;
  if (!excludeItself) {
    if (predicate(el)) return el;
  }
  let parent: HTMLElement | null = el;
  while ((parent = parent.parentElement)) {
    if (predicate(parent)) {
      return parent;
    }
  }

  return null;
}

/**
 * Gets the closest ancestor of the given element having the given tagName.
 */
export function closestWithTag(
  el: HTMLElement,
  tagName: string
): HTMLElement | null {
  tagName = tagName.toUpperCase();
  return closest(
    el,
    (el) => {
      return el.tagName == tagName;
    },
    true
  );
}

export function isAnyInput(el: HTMLElement): boolean {
  return (
    /input|select|textarea|label|button|a|^a$/i.test(el.tagName) ||
    closestWithTag(el, "button") !== null
  );
}

export function shouldConsiderDoubleClick(target: HTMLElement): boolean {
  if (target.tagName === "A" || closestWithTag(target, "A") !== null) {
    return false;
  }
  return true;
}

export function scrollIntoViewById(id: string): void {
  const element = document.getElementById(id);

  if (element) {
    setTimeout(() => {
      element.scrollIntoView();
    }, 50);
  }
}

export default {
  contains,
  closest,
  closestWithTag,
  isAnyInput,
  shouldConsiderDoubleClick,
  scrollIntoViewById,
};
