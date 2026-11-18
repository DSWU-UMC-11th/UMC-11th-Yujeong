import { authApi } from "../auth-api";
import type { ApiResponse } from "../api-response";
import type { FavoriteItem } from "./get-favorites";

// POST /favorites: 즐겨찾기 등록 (body: movieId)
// 회원은 토큰으로 식별하므로 memberId는 보내지 않아요.
export function createFavorite(movieId: number) {
  return authApi
    .post("favorites", { json: { movieId } })
    .json<ApiResponse<FavoriteItem>>();
}
