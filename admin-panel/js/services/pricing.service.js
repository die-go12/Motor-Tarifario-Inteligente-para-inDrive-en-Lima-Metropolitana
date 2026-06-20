/**
 * Pricing Service - Gestión de tarifas y simulaciones
 * Maneja cálculo de precios, configuración de pesos y simulaciones
 */

import { apiService } from './api.service.js';
import { API_ENDPOINTS } from '../config.js';

class PricingService {
  constructor() {
    this.config = null;
    this.weights = this.getDefaultWeights();
  }

  /**
   * Pesos por defecto (fallback si no se puede cargar desde backend)
   */
  getDefaultWeights() {
    return {
      base: {
        distance: 40,    // 40%
        fuel: 25,        // 25%
        capacity: 20,    // 20%
        historic: 15     // 15%
      },
      dynamic: {
        traffic: 50,     // 50%
        hour: 30,        // 30%
        time: 20         // 20%
      },
      limits: {
        minimum: 3.00,
        maximum: 150.00,
        maxRatio: 3.5,
        maxTrafficMultiplier: 2.0
      }
    };
  }

  /**
   * Cargar configuración de pesos desde el backend (solo ADMIN)
   * @returns {Promise<Object>}
   */
  async loadConfig() {
    try {
      const config = await apiService.get(API_ENDPOINTS.PRICING.GET_CONFIG);
      this.config = {
        ...config,
        anomalyMediumDeviation: config.anomalyMediumDeviation ?? 15,
        anomalyHighDeviation: config.anomalyHighDeviation ?? 30
      };
      this.weights = {
        base: {
          distance: config.costPerKmBase ?? 40,
          fuel: config.fuelConsumptionPerKm ?? 25,
          capacity: config.capacityExtraCost ?? 20,
          historic: config.historicWeight ?? 15
        },
        dynamic: {
          traffic: config.trafficWeight ?? 50,
          hour: config.hourWeight ?? 30,
          time: config.timeWeight ?? 20
        },
        limits: {
          minimum: config.minAbsoluteFare ?? 3.00,
          maximum: config.maxAbsoluteFare ?? 150.00,
          maxRatio: config.maxRangeRatio ?? 3.5,
          maxTrafficMultiplier: config.trafficMultiplierCap ?? 2.0
        }
      };
      return this.config;
    } catch (error) {
      console.warn('Could not load config from backend, using defaults:', error);
      return this.getDefaultWeights();
    }
  }

  /**
   * Actualizar configuración de pesos (solo ADMIN)
   * @param {Object} configData
   * @returns {Promise<Object>}
   */
  async updateConfig(configData) {
    try {
      const currentConfig = this.config ?? {};
      const payload = {
        costPerKmBase: configData.costPerKmBase ?? configData.distanceWeight ?? currentConfig.costPerKmBase,
        fuelConsumptionPerKm: configData.fuelConsumptionPerKm ?? configData.fuelWeight ?? currentConfig.fuelConsumptionPerKm,
        fuelFactor: configData.fuelFactor ?? 1,
        capacityExtraCost: configData.capacityExtraCost ?? configData.capacityWeight ?? currentConfig.capacityExtraCost,
        historicWeight: configData.historicWeight ?? currentConfig.historicWeight,
        trafficWeight: configData.trafficWeight ?? currentConfig.trafficWeight,
        hourWeight: configData.hourWeight ?? currentConfig.hourWeight,
        timeWeight: configData.timeWeight ?? currentConfig.timeWeight,
        anomalyMediumDeviation: configData.anomalyMediumDeviation ?? currentConfig.anomalyMediumDeviation,
        anomalyHighDeviation: configData.anomalyHighDeviation ?? currentConfig.anomalyHighDeviation,
        trafficMultiplierCap: configData.trafficMultiplierCap ?? configData.maxTrafficMultiplier ?? currentConfig.trafficMultiplierCap,
        minAbsoluteFare: configData.minAbsoluteFare ?? configData.minimumPrice ?? currentConfig.minAbsoluteFare,
        maxAbsoluteFare: configData.maxAbsoluteFare ?? configData.maximumPrice ?? currentConfig.maxAbsoluteFare,
        maxRangeRatio: configData.maxRangeRatio ?? configData.maxRatio ?? currentConfig.maxRangeRatio
      };

      const updated = await apiService.put(
        API_ENDPOINTS.PRICING.UPDATE_CONFIG,
        payload
      );
      this.config = updated;
      return {
        success: true,
        config: updated,
        message: 'Configuración de tarifas actualizada'
      };
    } catch (error) {
      console.error('Update config error:', error);
      throw error;
    }
  }

  /**
   * Obtener anomalías de pricing para auditoría
   * @param {Object} params
   * @returns {Promise<Array>}
   */
  async getAnomalies(params = {}) {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, String(value));
        }
      });

      const suffix = query.toString() ? `?${query.toString()}` : '';
      const data = await apiService.get(`${API_ENDPOINTS.PRICING.ANOMALIES}${suffix}`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Get anomalies error:', error);
      throw error;
    }
  }

  /**
   * Obtener una cotización de precio
   * @param {Object|number} quoteParams
   * @returns {Promise<Object>} - {minimumPrice, maximumPrice}
   */
  async getQuote(quoteParams) {
    try {
      const payload = typeof quoteParams === 'number'
        ? { distanceKm: quoteParams }
        : quoteParams || {};

      const endpoint = payload.origin && payload.destination
        ? API_ENDPOINTS.TRIPS.QUOTE
        : API_ENDPOINTS.PRICING.QUOTE;

      const quote = await apiService.post(endpoint, payload);
      return {
        success: true,
        minimumPrice: quote.minimumPrice,
        maximumPrice: quote.maximumPrice,
        distanceKm: payload.distanceKm
      };
    } catch (error) {
      console.error('Get quote error:', error);
      return this.simulatePrice({ distanceKm: quoteParams.distanceKm || quoteParams });
    }
  }

  /**
   * Simulación local de tarifa
   * (Usar cuando /pricing/quote no está disponible)
   */
  simulatePrice(params) {
    const {
      distanceKm = 8.5,
      fuelPrice = 5.5,
      capacity = 4,
      traffic = 1.6,
      hour = 1.3,
      timeMultiplier = 1.1,
      historic = 15
    } = params;

    // Constantes de cálculo
    const COST_PER_KM = 1.50;
    const FUEL_CONSUMPTION = 0.10;
    const CAPACITY_COST = 0.50;

    // Cálculo base
    const distComponent = distanceKm * COST_PER_KM;
    const fuelComponent = fuelPrice * FUEL_CONSUMPTION * distanceKm * 0.25;
    const capacityComponent = Math.max(0, capacity - 1) * CAPACITY_COST;
    const historicComponent = historic * 0.15;

    // Mínimo (piso)
    let minimum = distComponent + fuelComponent + capacityComponent + historicComponent;
    minimum = Math.max(
      this.weights.limits.minimum,
      Math.round(minimum * 100) / 100
    );

    // Factor dinámico
    const factor = 1 +
      (traffic - 1) * 0.5 +
      (hour - 1) * 0.3 +
      (timeMultiplier - 1) * 0.2;

    // Máximo (techo)
    let maximum = minimum * factor;
    maximum = Math.min(
      this.weights.limits.maximum,
      Math.min(
        minimum * this.weights.limits.maxRatio,
        Math.round(maximum * 100) / 100
      )
    );

    return {
      success: true,
      minimumPrice: parseFloat(minimum.toFixed(2)),
      maximumPrice: parseFloat(maximum.toFixed(2)),
      breakdown: {
        distance: parseFloat(distComponent.toFixed(2)),
        fuel: parseFloat(fuelComponent.toFixed(2)),
        capacity: parseFloat(capacityComponent.toFixed(2)),
        historic: parseFloat(historicComponent.toFixed(2)),
        dynamicFactor: parseFloat(factor.toFixed(3))
      },
      distanceKm
    };
  }

  /**
   * Validar si un precio está dentro del rango permitido
   * @param {number} price
   * @param {number} minimum
   * @param {number} maximum
   * @returns {Object} - {isValid, message}
   */
  validatePrice(price, minimum, maximum) {
    if (price < minimum) {
      return {
        isValid: false,
        message: `Precio por debajo del mínimo permitido (S/${minimum.toFixed(2)})`
      };
    }

    if (price > maximum) {
      return {
        isValid: false,
        message: `Precio por encima del máximo permitido (S/${maximum.toFixed(2)})`
      };
    }

    return {
      isValid: true,
      message: 'Precio válido'
    };
  }

  /**
   * Detectar anomalías en precios
   * @param {Array} trips
   * @returns {Array}
   */
  detectAnomalies(trips) {
    return trips.filter(t => {
      if (!t.minimumPrice || !t.maximumPrice) return false;

      const ratio = t.maximumPrice / t.minimumPrice;
      const exceedsMaxRatio = ratio > this.weights.limits.maxRatio;

      return exceedsMaxRatio;
    });
  }

  /**
   * Obtener reporte de pesos configurados
   * @returns {Object}
   */
  getWeightsReport() {
    return {
      base: this.weights.base,
      baseTotal: Object.values(this.weights.base).reduce((a, b) => a + b, 0),
      dynamic: this.weights.dynamic,
      dynamicTotal: Object.values(this.weights.dynamic).reduce((a, b) => a + b, 0),
      limits: this.weights.limits
    };
  }

  /**
   * Formatear precio para UI
   * @param {number} price
   * @returns {string}
   */
  formatPrice(price) {
    return `S/ ${Number(price).toFixed(2)}`;
  }
}

// Exportar instancia singleton
export const pricingService = new PricingService();
