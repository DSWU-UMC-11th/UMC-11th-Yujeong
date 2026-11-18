import { apiClient } from "../api-client";

export interface Rating {
  ratingId: number;
  movieId: number;
  score: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

// GET /members/{memberId}/ratings: 회원이 남긴 평점 목록
// 누구나 볼 수 있는 공개 API라서 토큰이 필요 없는 apiClient로 요청해요.
// 이 API는 공통 응답 형식 없이 평점 배열을 그대로 돌려줘요.
export function getMemberRatings(memberId: number) {
  return apiClient.get(`members/${memberId}/ratings`).json<Rating[]>();
}
