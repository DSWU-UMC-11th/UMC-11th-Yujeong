import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRating } from "../api/ratings/delete-rating";
import type { Rating } from "../api/ratings/get-member-ratings";
import { ratingKeys } from "../api/query-keys";

export function useDeleteRatingMutation(memberId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRating,
    // mutate(ratingId)로 넘긴 값이 두 번째 인자(variables)로 들어와요.
    onSuccess: (_response, ratingId) => {
      // 삭제 응답은 result가 null이라 담긴 데이터가 없어요.
      // 대신 "어떤 ratingId를 지웠는지"는 우리가 알고 있으니 목록에서 빼요. (setQueryData)
      queryClient.setQueryData<Rating[]>(
        ratingKeys.byMember(memberId),
        (prev = []) => prev.filter((rating) => rating.ratingId !== ratingId),
      );
      alert("평점을 삭제했어요.");
    },
    onError: () => {
      alert("평점 삭제에 실패했어요. 다시 시도해 주세요.");
    },
  });
}
