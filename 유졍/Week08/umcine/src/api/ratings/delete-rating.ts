import { authApi } from "../auth-api";
import type { ApiResponse } from "../api-response";

// DELETE /ratings/{ratingId}: 평점 삭제 (성공 시 result: null)
export function deleteRating(ratingId: number) {
  return authApi.delete(`ratings/${ratingId}`).json<ApiResponse<null>>();
}
