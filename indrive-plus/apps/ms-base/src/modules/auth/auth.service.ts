import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '@app/shared';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { TokensService } from './tokens.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const PASSWORD_SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const password = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);
    const user = await this.usersService.create({ ...dto, password });
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
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
    await this.verifyRefreshToken(refreshToken);
    await this.tokensService.revokeRefreshToken(refreshToken);
    const user = await this.usersService.findById(stored.userId);
    return this.buildSession(user);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokensService.revokeRefreshToken(refreshToken);
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
