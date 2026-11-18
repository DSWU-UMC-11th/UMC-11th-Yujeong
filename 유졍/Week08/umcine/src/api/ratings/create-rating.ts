import { authApi } from "../auth-api";
import type { ApiResponse } from "../api-response";
import type { Rating } from "./get-member-ratings";

export interface CreateRatingRequest {
  movieId: number;
  score: number;
  comment?: string;
}

// POST /ratings: 평점 등록 → 응답 result에 저장된 평점이 담겨 와요.
export function createRating(body: CreateRatingRequest) {
  return authApi.post("ratings", { json: body }).json<ApiResponse<Rating>>();
}
