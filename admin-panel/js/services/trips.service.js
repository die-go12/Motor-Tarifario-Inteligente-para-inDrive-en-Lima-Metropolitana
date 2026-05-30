/**
 * Trips Service - Gestión de viajes
 * Maneja CRUD de viajes y cambios de estado
 */

import { apiService } from './api.service.js';
import { API_ENDPOINTS } from '../config.js';

class TripsService {
  /**
   * Crear un nuevo viaje
   * @param {Object} tripData - {origin, destination, distanceKm}
   * @returns {Promise<Object>}
   */
  async createTrip(tripData) {
    try {
      const trip = await apiService.post(API_ENDPOINTS.TRIPS.CREATE, tripData);
      return {
        success: true,
        trip,
        message: `Viaje #${trip.id} creado: Rango S/${trip.minimumPrice.toFixed(2)} — S/${trip.maximumPrice.toFixed(2)}`
      };
    } catch (error) {
      console.error('Create trip error:', error);
      throw error;
    }
  }

  /**
   * Obtener mis viajes (según rol del usuario)
   * @returns {Promise<Array>}
   */
  async getMyTrips(filter = null) {
    try {
      let trips = await apiService.get(API_ENDPOINTS.TRIPS.LIST);
      
      // Filtrar por estado si se especifica
      if (filter) {
        trips = trips.filter(t => t.status === filter);
      }

      return trips;
    } catch (error) {
      console.error('Get trips error:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los viajes (para dashboard admin)
   * @param {string} filter - Estado para filtrar (opcional)
   * @returns {Promise<Array>}
   */
  async getAllTrips(filter = null) {
    try {
      return await this.getMyTrips(filter);
    } catch (error) {
      console.error('Get all trips error:', error);
      throw error;
    }
  }

  /**
   * Obtener un viaje específico por ID
   * @param {number} tripId
   * @returns {Promise<Object>}
   */
  async getTripById(tripId) {
    try {
      return await apiService.get(API_ENDPOINTS.TRIPS.GET_ONE(tripId));
    } catch (error) {
      console.error('Get trip detail error:', error);
      throw error;
    }
  }

  /**
   * Obtener viajes disponibles (solo para DRIVER)
   * @returns {Promise<Array>}
   */
  async getAvailableTrips() {
    try {
      return await apiService.get(API_ENDPOINTS.TRIPS.GET_AVAILABLE);
    } catch (error) {
      console.error('Get available trips error:', error);
      throw error;
    }
  }

  /**
   * Asignar un viaje a un conductor (solo DRIVER)
   * @param {number} tripId
   * @returns {Promise<Object>}
   */
  async assignTrip(tripId) {
    try {
      const trip = await apiService.patch(API_ENDPOINTS.TRIPS.ASSIGN(tripId), {});
      return {
        success: true,
        trip,
        message: `Viaje asignado correctamente`
      };
    } catch (error) {
      console.error('Assign trip error:', error);
      throw error;
    }
  }

  /**
   * Iniciar un viaje (solo DRIVER)
   * @param {number} tripId
   * @returns {Promise<Object>}
   */
  async startTrip(tripId) {
    try {
      const trip = await apiService.patch(API_ENDPOINTS.TRIPS.START(tripId), {});
      return {
        success: true,
        trip,
        message: `Viaje iniciado`
      };
    } catch (error) {
      console.error('Start trip error:', error);
      throw error;
    }
  }

  /**
   * Completar un viaje (solo DRIVER)
   * @param {number} tripId
   * @param {number} realPrice - Precio final negociado
   * @returns {Promise<Object>}
   */
  async completeTrip(tripId, realPrice) {
    try {
      const trip = await apiService.patch(
        API_ENDPOINTS.TRIPS.COMPLETE(tripId),
        { realPrice }
      );
      return {
        success: true,
        trip,
        message: `Viaje completado: S/${realPrice.toFixed(2)}`
      };
    } catch (error) {
      console.error('Complete trip error:', error);
      throw error;
    }
  }

  /**
   * Cancelar un viaje
   * @param {number} tripId
   * @returns {Promise<Object>}
   */
  async cancelTrip(tripId) {
    try {
      const trip = await apiService.patch(
        API_ENDPOINTS.TRIPS.CANCEL(tripId),
        {}
      );
      return {
        success: true,
        trip,
        message: `Viaje cancelado`
      };
    } catch (error) {
      console.error('Cancel trip error:', error);
      throw error;
    }
  }

  /**
   * Filtrar viajes por estado
   * @param {Array} trips
   * @param {string} status
   * @returns {Array}
   */
  filterByStatus(trips, status) {
    return trips.filter(t => t.status === status);
  }

  /**
   * Agrupar viajes por estado
   * @param {Array} trips
   * @returns {Object}
   */
  groupByStatus(trips) {
    return trips.reduce((acc, trip) => {
      if (!acc[trip.status]) acc[trip.status] = [];
      acc[trip.status].push(trip);
      return acc;
    }, {});
  }

  /**
   * Detectar viajes anómalos (gap de precio muy alto)
   * @param {Array} trips
   * @param {number} threshold
   * @returns {Array}
   */
  findOutliers(trips, threshold = 15) {
    return trips.filter(t => 
      t.maximumPrice && t.finalPrice && 
      (t.maximumPrice - t.finalPrice) > threshold
    );
  }

  /**
   * Calcular estadísticas de viajes
   * @param {Array} trips
   * @returns {Object}
   */
  calculateStats(trips) {
    if (!trips.length) {
      return {
        total: 0,
        completed: 0,
        cancelled: 0,
        active: 0,
        avgPrice: 0,
        totalEarnings: 0
      };
    }

    const completed = trips.filter(t => t.status === 'COMPLETED');
    const cancelled = trips.filter(t => t.status === 'CANCELLED');
    const active = trips.filter(t => ['SEARCHING', 'ASSIGNED', 'ACTIVE'].includes(t.status));

    const totalEarnings = completed.reduce((sum, t) => sum + (t.finalPrice || 0), 0);
    const avgPrice = completed.length ? totalEarnings / completed.length : 0;

    return {
      total: trips.length,
      completed: completed.length,
      cancelled: cancelled.length,
      active: active.length,
      avgPrice: avgPrice.toFixed(2),
      totalEarnings: totalEarnings.toFixed(2)
    };
  }
}

// Exportar instancia singleton
export const tripsService = new TripsService();
