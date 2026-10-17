export const ALLOWED_BRANCHES = [
  'CSE',
  'CSE (AI)',
  'CSE (AIML)',
  'CS',
  'CSIT',
  'IT',
  'CYBER SECURITY',
  'DATA SCIENCE',
  'EEE',
  'ECE',
  'AMIA',
  'OTHER',
] as const;

export type Branch = (typeof ALLOWED_BRANCHES)[number];

export const ALLOWED_YEARS = ['1', '2'] as const;
export type Year = (typeof ALLOWED_YEARS)[number];

export const ALLOWED_SECTIONS = ['A', 'B', 'C', 'D', 'E'] as const;
export type Section = (typeof ALLOWED_SECTIONS)[number];

export const KIET_EMAIL_DOMAIN = '@kiet.edu';
