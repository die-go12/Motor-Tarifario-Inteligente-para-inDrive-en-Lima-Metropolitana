/**
 * Formatea un número o string numérico a moneda peruana (soles).
 */
export const formatSoles = (amount: number | string): string => {
  const val = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `S/ ${(val && !isNaN(val)) ? val.toFixed(2) : '0.00'}`;
};

/**
 * Formatea distancia en kilómetros con 1 decimal.
 */
export const formatDistancia = (km: number | string): string => {
  const val = typeof km === 'string' ? parseFloat(km) : km;
  return `${(val && !isNaN(val)) ? val.toFixed(1) : '0.0'} km`;
};

/**
 * Formatea duración en minutos como texto legible.
 */
export const formatDuracion = (minutos: number | string): string => {
  const val = typeof minutos === 'string' ? parseFloat(minutos) : minutos;
  if (!val || isNaN(val)) return '0 min';
  if (val < 60) return `${Math.round(val)} min`;
  const horas = Math.floor(val / 60);
  const mins = Math.round(val % 60);
  return `${horas}h ${mins}min`;
};
