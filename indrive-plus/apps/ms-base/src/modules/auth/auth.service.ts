import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { JwtPayload, UserRole } from '@app/shared';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { TokensService } from './tokens.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const SELF_REGISTRATION_ROLES: readonly UserRole[] = [
  UserRole.PASSENGER,
  UserRole.DRIVER,
];

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly vehiclesService: VehiclesService,
    private readonly tokensService: TokensService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    this.assertSelfRegistrationRole(dto.role);

    if (dto.role === UserRole.DRIVER) {
      if (!dto.vehicleProfile) {
        throw new BadRequestException(
          'El perfil del vehículo es obligatorio para conductores',
        );
      }
      if (
        dto.vehicleProfile.capacity === undefined ||
        dto.vehicleProfile.capacity === null
      ) {
        throw new BadRequestException(
          'La capacidad del vehículo es obligatoria para conductores',
        );
      }
    }

    const user = await this.usersService.create(dto);

    if (dto.role === UserRole.DRIVER && dto.vehicleProfile) {
      try {
        await this.vehiclesService.register(user.id, dto.vehicleProfile);
      } catch (error) {
        await this.usersService.remove(user.id).catch(() => undefined);
        throw error;
      }
    }

    return this.buildSession(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('La cuenta está inactiva');
    }
    return this.buildSession(user);
  }

  async refresh(refreshToken: string) {
    const stored =
      await this.tokensService.findActiveRefreshToken(refreshToken);
    if (!stored) {
      await this.revokeFamilyOnReuse(refreshToken);
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
    await this.verifyRefreshToken(refreshToken);
    const user = await this.usersService.findById(stored.userId);
    if (!user.isActive) {
      await this.tokensService.revokeAllForUser(user.id);
      throw new UnauthorizedException('La cuenta está inactiva');
    }
    const rotated = await this.tokensService.revokeRefreshToken(refreshToken);
    if (!rotated) {
      await this.tokensService.revokeAllForUser(user.id);
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
    return this.buildSession(user);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokensService.revokeRefreshToken(refreshToken);
  }

  private assertSelfRegistrationRole(role: UserRole): void {
    if (!SELF_REGISTRATION_ROLES.includes(role)) {
      throw new ForbiddenException(
        'El registro público solo permite los roles pasajero o conductor',
      );
    }
  }

  private async revokeFamilyOnReuse(refreshToken: string): Promise<void> {
    const known = await this.tokensService.findRefreshTokenRecord(refreshToken);
    if (known) {
      await this.tokensService.revokeAllForUser(known.userId);
    }
  }

  private async buildSession(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = await this.signAccessToken(payload);
    const refreshToken = await this.signRefreshToken(payload);
    await this.persistRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken, tokenType: 'Bearer', user };
  }

  private signAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(
      payload,
      this.buildSignOptions('JWT_ACCESS_SECRET', 'JWT_ACCESS_EXPIRES', '15m'),
    );
  }

  private signRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(
      { ...payload, jti: randomUUID() },
      this.buildSignOptions('JWT_REFRESH_SECRET', 'JWT_REFRESH_EXPIRES', '7d'),
    );
  }

  private buildSignOptions(
    secretKey: string,
    expiresKey: string,
    defaultExpires: string,
  ): JwtSignOptions {
    const expiresIn = this.configService.get<string>(
      expiresKey,
      defaultExpires,
    );
    return {
      secret: this.configService.getOrThrow<string>(secretKey),
      expiresIn: expiresIn as JwtSignOptions['expiresIn'],
    };
  }

  private verifyRefreshToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
    });
  }

  private async persistRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const decoded = this.jwtService.decode<{ exp: number }>(refreshToken);
    const expiresAt = new Date(decoded.exp * 1000);
    await this.tokensService.saveRefreshToken(userId, refreshToken, expiresAt);
  }
}
