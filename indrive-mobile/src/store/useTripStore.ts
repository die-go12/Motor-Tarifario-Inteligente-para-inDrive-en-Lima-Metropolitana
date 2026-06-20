import { create } from 'zustand';

export type TripStatus = 'SEARCHING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Coords {
  latitude: number;
  longitude: number;
}

export interface TarifaRango {
  minimo: number;
  maximo: number;
}

export interface Oferta {
  offerId: number;
  conductorId: string;
  conductorNombre: string;
  conductorFoto?: string;
  vehiculoPlaca: string;
  vehiculoModelo: string;
  montoPropuesto: number;
}

export interface ViajeActivo {
  id: string;
  status: TripStatus;
  origen: Coords;
  destino: Coords;
  origenDireccion: string;
  destinoDireccion: string;
  distanciaKm: number;
  duracionMin: number;
  tarifa: TarifaRango;
  tarifaFinal?: number;
  acceptedPrice?: number;
  conductorId?: string;
  conductorUbicacion?: Coords;
  conductorNombre?: string;
  vehiculoPlaca?: string;
  vehiculoModelo?: string;
}

interface TripState {
  viajeActivo: ViajeActivo | null;
  rutaCoords: Coords[];
  ofertas: Oferta[];

  // Acciones
  setViajeActivo: (viaje: ViajeActivo | null) => void;
  actualizarEstado: (status: TripStatus) => void;
  actualizarUbicacionConductor: (coords: Coords) => void;
  agregarOferta: (oferta: Oferta) => void;
  setRutaCoords: (coords: Coords[]) => void;
  setTarifaFinal: (monto: number, minimo?: number, maximo?: number) => void;
  reset: () => void;
}

export const useTripStore = create<TripState>((set) => ({
  viajeActivo: null,
  rutaCoords: [],
  ofertas: [],

  setViajeActivo: (viaje) => set({ viajeActivo: viaje, ofertas: [] }),

  actualizarEstado: (status) =>
    set((state) => ({
      viajeActivo: state.viajeActivo
        ? { ...state.viajeActivo, status }
        : null,
    })),

  actualizarUbicacionConductor: (coords) =>
    set((state) => ({
      viajeActivo: state.viajeActivo
        ? { ...state.viajeActivo, conductorUbicacion: coords }
        : null,
    })),

  agregarOferta: (oferta) =>
    set((state) => ({ ofertas: [...state.ofertas, oferta] })),

  setRutaCoords: (coords) => set({ rutaCoords: coords }),

  setTarifaFinal: (monto, minimo, maximo) =>
    set((state) => ({
      viajeActivo: state.viajeActivo
        ? {
            ...state.viajeActivo,
            tarifaFinal: monto,
            status: 'COMPLETED',
            tarifa: {
              minimo: minimo !== undefined ? minimo : state.viajeActivo.tarifa.minimo,
              maximo: maximo !== undefined ? maximo : state.viajeActivo.tarifa.maximo,
            },
          }
        : null,
    })),

  reset: () => set({ viajeActivo: null, rutaCoords: [], ofertas: [] }),
}));
