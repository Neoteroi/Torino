import {en} from "./languages/en";

export const vocabulary = en;

// TODO: fetch dictionaries lazily, define interface - how?

export function i(): typeof vocabulary {
  // TODO: return the current vocabulary by current language
  return en;
}

// export class LocaleError extends Error {}
//
// export class MissingVocabularyError extends LocaleError {
//   constructor(language: string) {
//     super(`Missing vocabulary for language ${language}`);
//   }
// }
// export class I {
//   locale: string;
//   vocabularies: {[key: string]: typeof vocabulary};
//
//   constructor(initialLocale: string) {
//     this.locale = initialLocale;
//     this.vocabularies = {};
//   }
//
//   getVocabulary(language: string): typeof vocabulary {
//     const vocabulary = this.vocabularies[language];
//
//     if (!vocabulary) {
//       throw new MissingVocabularyError(language);
//     }
//
//     return vocabulary;
//   }
// }
