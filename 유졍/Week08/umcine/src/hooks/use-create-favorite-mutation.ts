import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFavorite } from "../api/favorites/create-favorite";
import type { FavoriteStatus } from "../api/favorites/get-favorite-status";
import { favoriteKeys } from "../api/query-keys";

export function useCreateFavoriteMutation(movieId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createFavorite(movieId),
    onSuccess: () => {
      // ① 즐겨찾기 여부: 등록에 성공했으니 결과가 "true"인 걸 이미 알아요.
      //    다시 조회하지 않고 캐시를 직접 바꿔서 버튼을 바로 바꿔요. (setQueryData)
      queryClient.setQueryData<FavoriteStatus>(favoriteKeys.status(movieId), {
        isFavorite: true,
      });
      // ② 즐겨찾기 목록: 지금 화면(영화 상세)에서는 안 보이는 데이터예요.
      //    stale로만 표시해 두면, 마이페이지를 열 때 최신 목록을 다시 받아와요. (invalidateQueries)
      queryClient.invalidateQueries({ queryKey: favoriteKeys.list() });
    },
    onError: () => {
      alert("즐겨찾기 등록에 실패했어요. 다시 시도해 주세요.");
    },
  });
}
