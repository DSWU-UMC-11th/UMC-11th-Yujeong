import { useQuery } from "@tanstack/react-query";
import { getFavoriteStatus } from "@/api/favorites/get-favorite-status";
import { favoriteKeys } from "@/api/query-keys";
import { useCreateFavoriteMutation } from "@/hooks/use-create-favorite-mutation";
import { useDeleteFavoriteMutation } from "@/hooks/use-delete-favorite-mutation";

interface FavoriteButtonProps {
  movieId: number;
}

// 영화 상세에서 쓰는 즐겨찾기 버튼 (로그인한 상태에서만 렌더링해요)
export function FavoriteButton({ movieId }: FavoriteButtonProps) {
  // GET /favorites/{movieId}: 이 영화를 즐겨찾기했는지 서버에 물어봐요.
  const statusQuery = useQuery({
    queryKey: favoriteKeys.status(movieId),
    queryFn: () => getFavoriteStatus(movieId),
  });

  const createMutation = useCreateFavoriteMutation(movieId);
  const deleteMutation = useDeleteFavoriteMutation(movieId);

  // 등록이나 해제 중에는 버튼을 막아서 중복 요청을 막아요.
  const isPending = createMutation.isPending || deleteMutation.isPending;

  if (statusQuery.isPending) {
    return (
      <span className="inline-block h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
    );
  }

  if (statusQuery.isError) {
    return <p className="text-sm text-red-500">즐겨찾기 정보를 불러오지 못했어요.</p>;
  }

  const isFavorite = statusQuery.data.isFavorite;

  const handleClick = () => {
    if (isPending) return;
    // 지금 상태에 따라 해제(DELETE) 또는 등록(POST)을 보내요.
    if (isFavorite) {
      deleteMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={isFavorite}
      className={
        isFavorite
          ? "rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
          : "rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 disabled:opacity-50"
      }
    >
      {isPending ? "처리 중" : isFavorite ? "★ 즐겨찾기 해제" : "☆ 즐겨찾기"}
    </button>
  );
}
