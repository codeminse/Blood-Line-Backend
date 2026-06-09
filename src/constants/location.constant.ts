export const FENI_LOCATIONS = [
  'Feni Sadar',
  'Sonagazi',
  'Fulgazi',
  'Chhagalnaiya',
  'Daganbhuiyan',
  'Parshuram',
] as const;

export type FeniLocation = (typeof FENI_LOCATIONS)[number];
