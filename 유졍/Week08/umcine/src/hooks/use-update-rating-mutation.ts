import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRating } from "../api/ratings/update-rating";
import type { Rating } from "../api/ratings/get-member-ratings";
import { ratingKeys } from "../api/query-keys";

export function useUpdateRatingMutation(memberId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRating,
    onSuccess: (response) => {
      const updated = response.result;
      // 목록에서 같은 ratingId인 항목만 응답 값으로 바꿔요. (setQueryData)
      queryClient.setQueryData<Rating[]>(
        ratingKeys.byMember(memberId),
        (prev = []) =>
          prev.map((rating) =>
            rating.ratingId === updated.ratingId ? updated : rating,
          ),
      );
      alert("평점을 수정했어요.");
    },
    onError: () => {
      alert("평점 수정에 실패했어요. 다시 시도해 주세요.");
    },
  });
}
