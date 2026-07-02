import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { MoreThan, Repository } from 'typeorm';
import { TokenType } from '@app/shared';
import { Token } from './entities/token.entity';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(Token)
    private readonly tokensRepository: Repository<Token>,
  ) {}

  saveRefreshToken(
    userId: number,
    token: string,
    expiresAt: Date,
  ): Promise<Token> {
    const refreshToken = this.tokensRepository.create({
      userId,
      token: this.hashToken(token),
      tokenType: TokenType.REFRESH,
      expiresAt,
    });
    return this.tokensRepository.save(refreshToken);
  }

  findActiveRefreshToken(token: string): Promise<Token | null> {
    return this.tokensRepository.findOne({
      where: {
        token: this.hashToken(token),
        tokenType: TokenType.REFRESH,
        isRevoked: false,
        expiresAt: MoreThan(new Date()),
      },
    });
  }

  findRefreshTokenRecord(token: string): Promise<Token | null> {
    return this.tokensRepository.findOne({
      where: {
        token: this.hashToken(token),
        tokenType: TokenType.REFRESH,
      },
    });
  }

  async revokeRefreshToken(token: string): Promise<boolean> {
    const result = await this.tokensRepository.update(
      {
        token: this.hashToken(token),
        tokenType: TokenType.REFRESH,
        isRevoked: false,
      },
      { isRevoked: true },
    );
    return (result.affected ?? 0) > 0;
  }

  async revokeAllForUser(userId: number): Promise<void> {
    await this.tokensRepository.update(
      { userId, tokenType: TokenType.REFRESH, isRevoked: false },
      { isRevoked: true },
    );
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
