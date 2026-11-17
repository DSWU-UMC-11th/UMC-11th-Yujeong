// src/controller/rating.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { CreateRatingDto } from '../dto/create-rating.dto';
import { UpdateRatingDto } from '../dto/update-rating.dto';
import { RatingService } from '../service/rating.service';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';

@Controller('ratings')
@UseGuards(JwtAuthGuard)
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  // 회원의 평점 조회
  @Get()
  getMyRatings(@Req() req: Request) {
    const memberId = req.memberId!;
    return this.ratingService.getRatingsByMember(memberId);
  }

  // 평점 등록
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: Request, @Body() dto: CreateRatingDto) {
    const memberId = req.memberId!;
    const ratingId = await this.ratingService.create(memberId, dto);

    return {
      isSuccess: true,
      code: 'COMMON201',
      message: '평점 등록에 성공했습니다.',
      result: {
        ratingId,
      },
    };
  }

  // 평점 수정
  @Patch(':ratingId')
  async update(
    @Req() req: Request,
    @Param('ratingId', ParseIntPipe) ratingId: number,
    @Body() dto: UpdateRatingDto,
  ) {
    const memberId = req.memberId!;

    await this.ratingService.update(ratingId, memberId, dto);

    return {
      isSuccess: true,
      code: 'COMMON200',
      message: '평점 수정에 성공했습니다.',
      result: null,
    };
  }

  // 평점 삭제
  @Delete(':ratingId')
  async delete(
    @Req() req: Request,
    @Param('ratingId', ParseIntPipe) ratingId: number,
  ) {
    const memberId = req.memberId!;

    await this.ratingService.delete(ratingId, memberId);

    return {
      isSuccess: true,
      code: 'COMMON200',
      message: '평점 삭제에 성공했습니다.',
      result: null,
    };
  }
}
