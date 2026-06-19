import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { Token } from './entities/token.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokensService } from './tokens.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Token]),
    PassportModule,
    JwtModule.register({}),
    UsersModule,
    VehiclesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, TokensService, JwtStrategy],
})
export class AuthModule {}
