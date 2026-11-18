import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRating } from "../api/ratings/create-rating";
import type { Rating } from "../api/ratings/get-member-ratings";
import { ratingKeys } from "../api/query-keys";

export function useCreateRatingMutation(memberId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRating,
    onSuccess: (response) => {
      // 응답 result에 저장된 평점 전체가 담겨 오므로,
      // 다시 조회하지 않고 내 평점 목록 캐시 맨 앞에 끼워 넣어요. (setQueryData)
      queryClient.setQueryData<Rating[]>(
        ratingKeys.byMember(memberId),
        (prev = []) => [response.result, ...prev],
      );
      alert("평점을 등록했어요.");
    },
    onError: () => {
      alert("평점 등록에 실패했어요. 이미 평점을 남긴 영화인지 확인해 주세요.");
    },
  });
}
