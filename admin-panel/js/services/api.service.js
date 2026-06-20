/**
 * API Service - Cliente HTTP centralizado
 * Maneja todas las peticiones HTTP, autenticación y manejo de errores
 */

import { API_CONFIG, AUTH_CONFIG, UI_CONSTANTS } from '../config.js';

class ApiService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.timeout = UI_CONSTANTS.DEFAULT_TIMEOUT;
  }

  resolveBase(path) {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    if (
      normalized.startsWith('/pricing/config') ||
      normalized.startsWith('/pricing/anomalies')
    ) {
      return API_CONFIG.GATEWAY;
    }
    if (normalized.startsWith('/pricing')) {
      return API_CONFIG.MS_PRICING;
    }
    if (
      normalized.startsWith('/auth') ||
      normalized.startsWith('/audit') ||
      normalized.startsWith('/users') ||
      normalized.startsWith('/trips') ||
      normalized.startsWith('/vehicles')
    ) {
      return API_CONFIG.GATEWAY;
    }
    return API_CONFIG.BASE_URL;
  }

  getRemoteFallbackBase(baseUrl) {
    try {
      const target = new URL(baseUrl);
      const current = window.location;
      const isCurrentLocal =
        current.hostname === 'localhost' || current.hostname === '127.0.0.1';
      const isTargetLocal =
        target.hostname === 'localhost' || target.hostname === '127.0.0.1';

      if (!isTargetLocal || isCurrentLocal) {
        return null;
      }

      const port = target.port || (target.protocol === 'https:' ? '443' : '80');
      let host = current.hostname;

      // Soporte para GitHub Codespaces: <name>-8080.app.github.dev -> <name>-3000.app.github.dev
      if (host.includes('app.github.dev')) {
        host = host.replace(/-\d+\./, `-${port}.`);
        return `${current.protocol}//${host}`;
      }

      return `${current.protocol}//${host}:${port}`;
    } catch {
      return null;
    }
  }

  /**
   * Obtener token JWT del localStorage
   */
  getToken() {
    return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY) || '';
  }

  /**
   * Guardar token JWT en localStorage
   */
  setToken(token) {
    if (token) {
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
    }
  }

  /**
   * Limpiar token del localStorage
   */
  clearToken() {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
  }

  /**
   * Construir headers HTTP con autenticación
   */
  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    const token = this.getToken();
    if (token && token !== 'DEMO') {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Realizar petición HTTP con manejo de errores
   * @param {string} path - Ruta relativa (ej: /auth/login)
   * @param {Object} options - Opciones de fetch (method, body, headers, etc)
   * @returns {Promise<Object>} - Respuesta JSON
   */
  async request(path, options = {}) {
    const baseUrl = this.resolveBase(path);
    const url = baseUrl + path;
    const config = {
      method: options.method || 'GET',
      headers: this.getHeaders(options.headers),
      signal: AbortSignal.timeout(this.timeout),
      ...options
    };

    // Si hay body, convertir a JSON
    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      
      // Manejar errores HTTP
      if (!response.ok) {
        // Si es 401, token expirado o inválido
        if (response.status === 401) {
          this.clearToken();
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }

        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `Error ${response.status}` };
        }

        const error = new Error(errorData.message || 'Error en la petición');
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      // Respuesta vacía (204 No Content)
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        const fallbackBase = this.getRemoteFallbackBase(baseUrl);
        if (fallbackBase) {
          const fallbackUrl = fallbackBase + path;
          const retryResponse = await fetch(fallbackUrl, config);

          if (!retryResponse.ok) {
            if (retryResponse.status === 401) {
              this.clearToken();
              window.dispatchEvent(new CustomEvent('auth:logout'));
            }

            let retryErrorData;
            try {
              retryErrorData = await retryResponse.json();
            } catch {
              retryErrorData = { message: `Error ${retryResponse.status}` };
            }

            const retryError = new Error(
              retryErrorData.message || 'Error en la petición',
            );
            retryError.status = retryResponse.status;
            retryError.data = retryErrorData;
            throw retryError;
          }

          if (retryResponse.status === 204) {
            return null;
          }

          return await retryResponse.json();
        }
      }

      // Manejar timeout
      if (error.name === 'AbortError') {
        throw new Error('Timeout - El servidor no responde');
      }
      if (error instanceof TypeError) {
        throw new Error('No se pudo conectar al backend (verifica URL/puertos en Configuración)');
      }
      throw error;
    }
  }

  /**
   * GET - Obtener datos
   */
  get(path, options = {}) {
    return this.request(path, {
      ...options,
      method: 'GET'
    });
  }

  /**
   * POST - Crear datos
   */
  post(path, body, options = {}) {
    return this.request(path, {
      ...options,
      method: 'POST',
      body
    });
  }

  /**
   * PATCH - Actualizar datos (parcial)
   */
  patch(path, body, options = {}) {
    return this.request(path, {
      ...options,
      method: 'PATCH',
      body
    });
  }

  /**
   * PUT - Reemplazar datos (completo)
   */
  put(path, body, options = {}) {
    return this.request(path, {
      ...options,
      method: 'PUT',
      body
    });
  }

  /**
   * DELETE - Eliminar datos
   */
  delete(path, options = {}) {
    return this.request(path, {
      ...options,
      method: 'DELETE'
    });
  }

  /**
   * Cambiar URL base (útil para cambiar entre URLs en tiempo de ejecución)
   */
  setBaseUrl(url) {
    this.baseUrl = url;
  }

  /**
   * Cambiar timeout global
   */
  setTimeout(ms) {
    this.timeout = ms;
  }
}

// Exportar instancia singleton
export const apiService = new ApiService();
