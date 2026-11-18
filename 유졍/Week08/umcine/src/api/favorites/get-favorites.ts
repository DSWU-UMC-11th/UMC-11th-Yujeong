import { authApi } from "../auth-api";
import type { ApiResponse } from "../api-response";

export interface FavoriteItem {
  favoriteId: number;
  movieId: number;
  createdAt: string;
}

// GET /favorites: 로그인한 회원의 즐겨찾기 목록 (최신순)
export async function getFavorites(): Promise<FavoriteItem[]> {
  const response = await authApi
    .get("favorites")
    .json<ApiResponse<FavoriteItem[]>>();
  return response.result;
}
