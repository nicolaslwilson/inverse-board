import Gradient from 'javascript-color-gradient';

export const HealthGradient = new Gradient().setColorGradient(
  '#ff0000',
  '#87d068',
);

export function getColorForHealth(health: number) {
  const index = Math.floor(health * 10);
  return HealthGradient.getColor(index);
}
