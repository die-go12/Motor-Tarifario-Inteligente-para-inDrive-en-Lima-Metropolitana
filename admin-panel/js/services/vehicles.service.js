import { apiService } from './api.service.js';
import { API_ENDPOINTS } from '../config.js';

class VehiclesService {
  async getVehicles() {
    try {
      return await apiService.get(
        `${API_ENDPOINTS.VEHICLES.LIST}?_=${Date.now()}`,
      );
    } catch (error) {
      console.error('Get vehicles error:', error);
      throw error;
    }
  }

  async getMyVehicle() {
    try {
      return await apiService.get(API_ENDPOINTS.VEHICLES.ME);
    } catch (error) {
      console.error('Get my vehicle error:', error);
      throw error;
    }
  }

  async getByDriver(driverId) {
    try {
      return await apiService.get(
        `${API_ENDPOINTS.VEHICLES.BY_DRIVER(driverId)}?_=${Date.now()}`,
      );
    } catch (error) {
      console.error('Get vehicle by driver error:', error);
      throw error;
    }
  }

  async upsertByDriver(driverId, vehicleData) {
    try {
      return await apiService.put(
        API_ENDPOINTS.VEHICLES.UPSERT_BY_DRIVER(driverId),
        vehicleData
      );
    } catch (error) {
      console.error('Upsert vehicle by driver error:', error);
      throw error;
    }
  }
}

export const vehiclesService = new VehiclesService();
