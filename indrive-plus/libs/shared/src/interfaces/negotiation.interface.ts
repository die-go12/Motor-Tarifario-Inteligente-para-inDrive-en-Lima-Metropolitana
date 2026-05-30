import { OfferSender, OfferStatus } from '../enums/offer-status.enum';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface OfferView {
  id: number;
  tripId: number;
  sender: OfferSender;
  amount: number;
  status: OfferStatus;
  driverId: number | null;
  createdAt: string;
}
