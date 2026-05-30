import { Injectable } from '@nestjs/common';
import { TrafficConditions } from '@app/shared';

const PEAK_HOURS = [7, 8, 9, 18, 19, 20];
const BUSY_HOURS = [10, 11, 12, 13, 14, 15, 16, 17];
const EVENING_HOURS = [21, 22, 23];

const PEAK: TrafficConditions = {
  trafficMultiplier: 1.9,
  hourMultiplier: 1.5,
  timeMultiplier: 1.3,
};
const BUSY: TrafficConditions = {
  trafficMultiplier: 1.4,
  hourMultiplier: 1.2,
  timeMultiplier: 1.1,
};
const LIGHT: TrafficConditions = {
  trafficMultiplier: 1.2,
  hourMultiplier: 1.1,
  timeMultiplier: 1.0,
};
const QUIET: TrafficConditions = {
  trafficMultiplier: 1.0,
  hourMultiplier: 1.0,
  timeMultiplier: 1.0,
};

@Injectable()
export class TrafficService {
  conditions(): TrafficConditions {
    const hour = new Date().getHours();
    if (PEAK_HOURS.includes(hour)) {
      return PEAK;
    }
    if (BUSY_HOURS.includes(hour)) {
      return BUSY;
    }
    if (EVENING_HOURS.includes(hour)) {
      return LIGHT;
    }
    return QUIET;
  }
}
