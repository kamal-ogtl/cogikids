export type SupportedLanguage = 'hausa' | 'english' | 'yoruba' | 'igbo';

export const LANGUAGES: Record<SupportedLanguage, { label: string; nativeName: string; code: string }> = {
  hausa:   { label: 'Hausa',   nativeName: 'Hausa',   code: 'ha' },
  english: { label: 'English', nativeName: 'English',  code: 'en' },
  yoruba:  { label: 'Yoruba',  nativeName: 'Yorùbá',  code: 'yo' },
  igbo:    { label: 'Igbo',    nativeName: 'Igbo',    code: 'ig' },
};

export const DEFAULT_NATIVE_LANGUAGE: SupportedLanguage = 'hausa';
