/**
 * UI Utilities - Funciones auxiliares para la interfaz
 * Toast, modales, loading, etc.
 */

import { UI_CONSTANTS } from '../config.js';

/**
 * Mostrar toast notification
 * @param {string} message
 * @param {boolean} isSuccess
 */
export function showToast(message, isSuccess = true) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast show ${isSuccess ? 'ok' : 'er'}`;

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.className = 'toast';
  }, UI_CONSTANTS.TOAST_DURATION);
}

/**
 * Mostrar loading en un elemento
 * @param {Element} element
 * @param {string} message
 */
export function showLoading(element, message = 'Cargando...') {
  if (!element) return;
  element.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <span>${message}</span>
    </div>
  `;
}

/**
 * Limpiar elemento
 * @param {Element} element
 */
export function clearElement(element) {
  if (element) element.innerHTML = '';
}

/**
 * Obtener elemento por ID
 * @param {string} id
 * @returns {Element|null}
 */
export function $(id) {
  return document.getElementById(id);
}

/**
 * Abrir modal
 */
export function openModal() {
  const modal = $('modal-overlay');
  if (modal) modal.classList.add('open');
}

/**
 * Cerrar modal
 */
export function closeModal() {
  const modal = $('modal-overlay');
  if (modal) modal.classList.remove('open');
}

/**
 * Navegar a una vista (tab)
 * @param {string} viewName - Nombre de la vista (dashboard, fleet, trips, etc.)
 */
export function navigateTo(viewName, navBtn = null) {
  // Ocultar todas las vistas
  document.querySelectorAll('.view').forEach(v => {
    v.classList.remove('active');
  });

  // Desactivar todos los nav items
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.remove('active');
  });

  // Mostrar vista seleccionada
  const view = $(`view-${viewName}`);
  if (view) view.classList.add('active');

  // Activar nav item
  if (navBtn) navBtn.classList.add('active');
}

/**
 * Formatear fecha a formato legible
 * @param {Date|string} date
 * @returns {string}
 */
export function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formatear hora
 * @param {Date|string} date
 * @returns {string}
 */
export function formatTime(date) {
  const d = new Date(date);
  return d.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Generar color de avatar basado en índice
 * @param {number} index
 * @param {Array} colors
 * @returns {string}
 */
export function getColorByIndex(index, colors = []) {
  const defaultColors = ['#C6F70A', '#61B8FF', '#FFC857', '#FF6B6B', '#A78BFA', '#34D399', '#F472B6'];
  const colorList = colors.length ? colors : defaultColors;
  return colorList[index % colorList.length];
}

/**
 * Obtener iniciales de un nombre
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Estado de viaje a etiqueta amigable
 * @param {string} status
 * @returns {Object} - {class, label}
 */
export function getStatusConfig(status) {
  const map = {
    COMPLETED: { class: 'settled', label: 'Completado' },
    ACTIVE: { class: 'active', label: 'Activo' },
    SEARCHING: { class: 'info', label: 'Buscando' },
    ASSIGNED: { class: 'moderate', label: 'Asignado' },
    CANCELLED: { class: 'cancelled', label: 'Cancelado' }
  };
  return map[status] || { class: 'moderate', label: status };
}

/**
 * Debounce - Esperar a que el usuario deje de escribir
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle - Ejecutar función con límite de frecuencia
 * @param {Function} func
 * @param {number} limit
 * @returns {Function}
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Copiar texto al portapapeles
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Copy to clipboard error:', err);
    return false;
  }
}

/**
 * Descargar JSON como archivo
 * @param {Object} data
 * @param {string} filename
 */
export function downloadJSON(data, filename = 'export.json') {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
