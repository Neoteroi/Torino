import {en} from "./languages/en";

export const vocabulary = en;

// TODO: fetch dictionaries lazily, define interface - how?

export function i(): typeof vocabulary {
  // TODO: return the current vocabulary by current language
  return en;
}
