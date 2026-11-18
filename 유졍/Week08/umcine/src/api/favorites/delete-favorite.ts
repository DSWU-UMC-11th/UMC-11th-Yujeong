import { authApi } from "../auth-api";
import type { ApiResponse } from "../api-response";

// DELETE /favorites/{movieId}: 즐겨찾기 해제 (성공 시 result: null)
export function deleteFavorite(movieId: number) {
  return authApi.delete(`favorites/${movieId}`).json<ApiResponse<null>>();
}
