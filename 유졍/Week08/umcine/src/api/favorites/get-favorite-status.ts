import { authApi } from "../auth-api";
import type { ApiResponse } from "../api-response";

export interface FavoriteStatus {
  isFavorite: boolean;
}

// GET /favorites/{movieId}: 이 영화를 즐겨찾기했는지 여부
// 즐겨찾기하지 않았어도 오류가 아니라 200 + isFavorite: false 가 와요.
export async function getFavoriteStatus(
  movieId: number,
): Promise<FavoriteStatus> {
  const response = await authApi
    .get(`favorites/${movieId}`)
    .json<ApiResponse<FavoriteStatus>>();
  return response.result;
}
