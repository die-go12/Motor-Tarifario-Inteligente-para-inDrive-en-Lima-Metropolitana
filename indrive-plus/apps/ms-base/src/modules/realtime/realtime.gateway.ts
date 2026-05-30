import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  AuthenticatedUser,
  DriverClientEvent,
  JwtPayload,
  PassengerClientEvent,
  ServerEvent,
} from '@app/shared';
import { TripsService } from '../trips/trips.service';
import { NegotiationService } from '../trips/negotiation.service';

interface OfferPayload {
  tripId: number;
  amount: number;
}

interface AcceptPayload {
  tripId: number;
  offerId: number;
}

interface LocationPayload {
  tripId: number;
  latitude: number;
  longitude: number;
}

interface TripPayload {
  tripId: number;
}

interface SocketData {
  user: AuthenticatedUser;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class RealtimeGateway implements OnGatewayConnection {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tripsService: TripsService,
    private readonly negotiationService: NegotiationService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const user = await this.authenticate(client);
      (client.data as SocketData).user = user;
      await client.join(this.userRoom(user.id));
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage(DriverClientEvent.SEND_OFFER)
  async onDriverOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: OfferPayload,
  ): Promise<void> {
    const user = this.userOf(client);
    await this.guard(client, async () => {
      const offer = await this.negotiationService.createOffer(
        payload.tripId,
        user,
        payload.amount,
      );
      const trip = await this.tripsService.findById(payload.tripId);
      this.emitToUser(trip.passengerId, ServerEvent.OFFER_RECEIVED, offer);
    });
  }

  @SubscribeMessage(PassengerClientEvent.ACCEPT_OFFER)
  async onAcceptOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: AcceptPayload,
  ): Promise<void> {
    const user = this.userOf(client);
    await this.guard(client, async () => {
      const trip = await this.negotiationService.acceptOffer(
        payload.tripId,
        payload.offerId,
        user,
      );
      this.emitToUser(trip.passengerId, ServerEvent.TRIP_ASSIGNED, trip);
      if (trip.driverId !== null) {
        this.emitToUser(trip.driverId, ServerEvent.TRIP_ASSIGNED, trip);
      }
    });
  }

  @SubscribeMessage(DriverClientEvent.UPDATE_LOCATION)
  async onDriverLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: LocationPayload,
  ): Promise<void> {
    await this.guard(client, async () => {
      const trip = await this.tripsService.findById(payload.tripId);
      this.emitToUser(trip.passengerId, ServerEvent.DRIVER_LOCATION_UPDATE, {
        tripId: payload.tripId,
        latitude: payload.latitude,
        longitude: payload.longitude,
      });
    });
  }

  @SubscribeMessage(DriverClientEvent.START_TRIP)
  async onStartTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TripPayload,
  ): Promise<void> {
    const user = this.userOf(client);
    await this.guard(client, async () => {
      const trip = await this.tripsService.start(payload.tripId, user.id);
      this.emitToUser(trip.passengerId, ServerEvent.TRIP_STARTED, trip);
      if (trip.driverId !== null) {
        this.emitToUser(trip.driverId, ServerEvent.TRIP_STARTED, trip);
      }
    });
  }

  @SubscribeMessage(PassengerClientEvent.CANCEL_TRIP)
  async onCancelTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TripPayload,
  ): Promise<void> {
    const user = this.userOf(client);
    await this.guard(client, async () => {
      const trip = await this.tripsService.cancel(payload.tripId, user.id);
      this.emitToUser(trip.passengerId, ServerEvent.TRIP_CANCELLED, trip);
      if (trip.driverId !== null) {
        this.emitToUser(trip.driverId, ServerEvent.TRIP_CANCELLED, trip);
      }
    });
  }

  private async authenticate(client: Socket): Promise<AuthenticatedUser> {
    const token = client.handshake.auth?.token as string | undefined;
    if (!token) {
      throw new Error('Token ausente');
    }
    const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
    return { id: payload.sub, email: payload.email, role: payload.role };
  }

  private async guard(
    client: Socket,
    action: () => Promise<void>,
  ): Promise<void> {
    try {
      await action();
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Error';
      client.emit('error', { message: reason });
      this.logger.warn(`Evento WS fallido: ${reason}`);
    }
  }

  private userOf(client: Socket): AuthenticatedUser {
    return (client.data as SocketData).user;
  }

  private emitToUser(
    userId: number,
    event: ServerEvent,
    payload: unknown,
  ): void {
    this.server.to(this.userRoom(userId)).emit(event, payload);
  }

  private userRoom(userId: number): string {
    return `user:${userId}`;
  }
}
