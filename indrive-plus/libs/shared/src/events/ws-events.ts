export enum PassengerClientEvent {
  REQUEST_TRIP = 'trip_request',
  ACCEPT_OFFER = 'accept_offer',
  CANCEL_TRIP = 'cancel_trip',
}

export enum DriverClientEvent {
  SEND_OFFER = 'driver_offer',
  UPDATE_LOCATION = 'driver_location',
  START_TRIP = 'start_trip',
  COMPLETE_TRIP = 'complete_trip',
}

export enum ServerEvent {
  TRIP_CREATED = 'trip_created',
  OFFER_RECEIVED = 'offer_received',
  TRIP_ASSIGNED = 'trip_assigned',
  DRIVER_LOCATION_UPDATE = 'driver_location_update',
  TRIP_STARTED = 'trip_started',
  TRIP_COMPLETED = 'trip_completed',
  TRIP_CANCELLED = 'trip_cancelled',
}
