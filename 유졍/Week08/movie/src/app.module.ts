// 우리 프로젝트는 도메인 모듈을 따로 만들지 않고 app.module.ts 한 곳에서 전부 등록하는 구조

// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './controller/auth.controller';
import { FavoriteController } from './controller/favorite.controller';
import { MemberController } from './controller/member.controller';
import { MovieRecordController } from './controller/movie-record.controller';
import { RatingController } from './controller/rating.controller';

import { Favorite } from './entity/favorite.entity';
import { Member } from './entity/member.entity';
import { Rating } from './entity/rating.entity';

import { AuthService } from './service/auth.service';
import { FavoriteService } from './service/favorite.service';
import { MemberService } from './service/member.service';
import { MovieRecordService } from './service/movie-record.service';
import { RatingService } from './service/rating.service';

import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }), // 기존 유지
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: false,
    }),
    TypeOrmModule.forFeature([Member, Rating, Favorite]), // Favorite 추가
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: Number(
            configService.get<string>('JWT_ACCESS_EXPIRATION') ?? 3600,
          ),
        },
      }),
    }),
  ],
  controllers: [
    AuthController,
    MemberController,
    RatingController,
    FavoriteController, // 추가
    MovieRecordController, // 추가
  ],
  providers: [
    AuthService,
    MemberService,
    RatingService,
    FavoriteService, // 추가
    MovieRecordService, // 추가
    JwtStrategy, // 기존 유지
  ],
})
export class AppModule {}
