export const isThreeCol = () =>
  (process.env.NEXT_PUBLIC_LAYOUT ?? 'two').toLowerCase() === 'three';