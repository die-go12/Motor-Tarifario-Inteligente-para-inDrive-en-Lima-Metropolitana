import { apiService } from './api.service.js';
import { API_ENDPOINTS } from '../config.js';

class VehiclesService {
  async getVehicles() {
    try {
      return await apiService.get(API_ENDPOINTS.VEHICLES.LIST);
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
}

export const vehiclesService = new VehiclesService();
