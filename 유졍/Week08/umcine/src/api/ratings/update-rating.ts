import { authApi } from "../auth-api";
import type { ApiResponse } from "../api-response";
import type { Rating } from "./get-member-ratings";

export interface UpdateRatingRequest {
  ratingId: number;
  score: number;
  comment?: string;
}

// PATCH /ratings/{ratingId}: 평점 수정 → 응답 result에 수정된 평점이 담겨 와요.
// ratingId는 주소에, score/comment는 body에 넣어요.
export function updateRating({ ratingId, ...body }: UpdateRatingRequest) {
  return authApi
    .patch(`ratings/${ratingId}`, { json: body })
    .json<ApiResponse<Rating>>();
}
