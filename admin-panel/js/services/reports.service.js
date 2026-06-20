/**
 * Reports Service - Resumen operativo del backend
 * Consume métricas agregadas desde ms-reports
 */

import { apiService } from './api.service.js';
import { API_ENDPOINTS } from '../config.js';

class ReportsService {
  /**
   * Obtener resumen agregado del sistema
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async getSummary(params = {}) {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, String(value));
        }
      });

      const suffix = query.toString() ? `?${query.toString()}` : '';
      const summary = await apiService.get(`${API_ENDPOINTS.REPORTS.SUMMARY}${suffix}`);
      return {
        totalQuotes: summary?.totalQuotes ?? 0,
        completedTrips: summary?.completedTrips ?? 0,
        totalRevenue: summary?.totalRevenue ?? 0,
        averageRevenue: summary?.averageRevenue ?? 0,
        averageDistanceKm: summary?.averageDistanceKm ?? 0,
        anomaliesBySeverity: summary?.anomaliesBySeverity || {
          LOW: 0,
          MEDIUM: 0,
          HIGH: 0
        }
      };
    } catch (error) {
      console.error('Get reports summary error:', error);
      throw error;
    }
  }
}

export const reportsService = new ReportsService();
