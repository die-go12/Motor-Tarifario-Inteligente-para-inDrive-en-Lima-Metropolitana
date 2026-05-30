/**
 * Formatea un número a moneda peruana (soles).
 */
export const formatSoles = (amount: number): string => {
  return `S/ ${amount.toFixed(2)}`;
};

/**
 * Formatea distancia en kilómetros con 1 decimal.
 */
export const formatDistancia = (km: number): string => {
  return `${km.toFixed(1)} km`;
};

/**
 * Formatea duración en minutos como texto legible.
 */
export const formatDuracion = (minutos: number): string => {
  if (minutos < 60) return `${Math.round(minutos)} min`;
  const horas = Math.floor(minutos / 60);
  const mins = Math.round(minutos % 60);
  return `${horas}h ${mins}min`;
};
