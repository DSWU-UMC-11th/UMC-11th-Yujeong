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
import { AuthGuard } from '../guard/auth.guard';
import { RatingService } from '../service/rating.service';

// [변경] 9주차 프론트 연동을 위해 API 명세와 맞췄습니다.
// - GET /members/:memberId/ratings 추가 (공개 API)
// - POST/PATCH/DELETE /ratings 는 즐겨찾기와 같은 AuthGuard 사용
// - update/delete 호출 시 서비스의 인자 순서(memberId, ratingId)에 맞게 수정
@Controller()
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  // 회원별 평점 조회: 누구나 볼 수 있는 공개 API라 Guard를 붙이지 않습니다.
  @Get('members/:memberId/ratings')
  getMemberRatings(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.ratingService.getRatingsByMember(memberId);
  }

  // 평점 등록: memberId는 Guard가 토큰에서 꺼내 request에 담아 둔 값을 씁니다.
  @Post('ratings')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() request: Request, @Body() dto: CreateRatingDto) {
    const memberId = request['memberId'] as number;

    const result = await this.ratingService.create(memberId, dto);
    return {
      isSuccess: true,
      code: 'COMMON201',
      message: '평점을 등록했습니다.',
      result,
    };
  }

  // 평점 수정
  @Patch('ratings/:ratingId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @Req() request: Request,
    @Param('ratingId', ParseIntPipe) ratingId: number,
    @Body() dto: UpdateRatingDto,
  ) {
    const memberId = request['memberId'] as number;

    // 서비스 시그니처: update(memberId, ratingId, dto)
    const result = await this.ratingService.update(memberId, ratingId, dto);
    return {
      isSuccess: true,
      code: 'COMMON200',
      message: '평점을 수정했습니다.',
      result,
    };
  }

  // 평점 삭제
  @Delete('ratings/:ratingId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async delete(
    @Req() request: Request,
    @Param('ratingId', ParseIntPipe) ratingId: number,
  ) {
    const memberId = request['memberId'] as number;

    // 서비스 시그니처: delete(memberId, ratingId)
    await this.ratingService.delete(memberId, ratingId);
    return {
      isSuccess: true,
      code: 'COMMON200',
      message: '평점을 삭제했습니다.',
      result: null,
    };
  }
}
