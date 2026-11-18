import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFavorite } from "../api/favorites/delete-favorite";
import type { FavoriteStatus } from "../api/favorites/get-favorite-status";
import { favoriteKeys } from "../api/query-keys";

export function useDeleteFavoriteMutation(movieId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteFavorite(movieId),
    onSuccess: () => {
      // 해제에 성공했으니 결과가 "false"인 걸 알아요 → 캐시를 직접 바꿔요.
      queryClient.setQueryData<FavoriteStatus>(favoriteKeys.status(movieId), {
        isFavorite: false,
      });
      // 목록은 다시 조회하도록 stale 표시만 해요.
      queryClient.invalidateQueries({ queryKey: favoriteKeys.list() });
    },
    onError: () => {
      alert("즐겨찾기 해제에 실패했어요. 다시 시도해 주세요.");
    },
  });
}
