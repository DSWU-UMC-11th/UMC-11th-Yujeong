import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMemberRatings } from "@/api/ratings/get-member-ratings";
import type { Rating } from "@/api/ratings/get-member-ratings";
import { ratingKeys } from "@/api/query-keys";
import { useCreateRatingMutation } from "@/hooks/use-create-rating-mutation";
import { useUpdateRatingMutation } from "@/hooks/use-update-rating-mutation";
import { useDeleteRatingMutation } from "@/hooks/use-delete-rating-mutation";

interface MyRatingSectionProps {
  memberId: number;
  movieId: number;
}

// 영화 상세에서 "내 평점"을 보여 주고 등록/수정/삭제하는 영역
export function MyRatingSection({ memberId, movieId }: MyRatingSectionProps) {
  // GET /members/{memberId}/ratings: 내가 남긴 평점 전체를 가져와요.
  const ratingsQuery = useQuery({
    queryKey: ratingKeys.byMember(memberId),
    queryFn: () => getMemberRatings(memberId),
  });

  // 수정 폼을 열었는지 여부 (화면에서만 쓰는 클라이언트 상태라 useState)
  const [isEditing, setIsEditing] = useState(false);

  const createMutation = useCreateRatingMutation(memberId);
  const updateMutation = useUpdateRatingMutation(memberId);
  const deleteMutation = useDeleteRatingMutation(memberId);

  if (ratingsQuery.isPending) {
    return <p className="text-gray-500">내 평점을 불러오는 중이에요.</p>;
  }

  if (ratingsQuery.isError) {
    return <p className="text-red-500">내 평점을 불러오지 못했어요.</p>;
  }

  // 전체 평점 중 지금 보고 있는 영화의 평점만 찾아요. 한 영화에 평점은 하나예요.
  const myRating = ratingsQuery.data.find((rating) => rating.movieId === movieId);

  // ① 아직 평점이 없으면: 등록 폼
  if (!myRating) {
    return (
      <section>
        <h2 className="mb-3 text-lg font-bold">내 평점 남기기</h2>
        <RatingForm
          submitLabel="등록"
          isPending={createMutation.isPending}
          onSubmit={({ score, comment }) =>
            createMutation.mutate({ movieId, score, comment })
          }
        />
      </section>
    );
  }

  // ② 평점이 있고 수정 중이면: 기존 값을 채운 수정 폼
  if (isEditing) {
    return (
      <section>
        <h2 className="mb-3 text-lg font-bold">내 평점 수정</h2>
        <RatingForm
          initialRating={myRating}
          submitLabel="저장"
          isPending={updateMutation.isPending}
          onCancel={() => setIsEditing(false)}
          onSubmit={({ score, comment }) =>
            updateMutation.mutate(
              { ratingId: myRating.ratingId, score, comment },
              // 이 호출이 성공했을 때만 수정 폼을 닫아요.
              { onSuccess: () => setIsEditing(false) },
            )
          }
        />
      </section>
    );
  }

  // ③ 평점이 있으면: 내 평점 보여 주기 + 수정/삭제 버튼
  const handleDelete = () => {
    if (deleteMutation.isPending) return;
    if (!window.confirm("이 영화의 평점을 삭제할까요?")) return;
    deleteMutation.mutate(myRating.ratingId);
  };

  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">내 평점</h2>
      <p className="text-xl text-yellow-500">
        {"★".repeat(myRating.score)}
        <span className="text-gray-300">{"★".repeat(5 - myRating.score)}</span>
        <span className="ml-2 text-base text-black">{myRating.score}점</span>
      </p>
      {myRating.comment && <p className="mt-2 text-gray-700">{myRating.comment}</p>}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
        >
          수정
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 disabled:opacity-50"
        >
          {deleteMutation.isPending ? "삭제 중" : "삭제"}
        </button>
      </div>
    </section>
  );
}

interface RatingFormValues {
  score: number;
  comment?: string;
}

interface RatingFormProps {
  initialRating?: Rating;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (values: RatingFormValues) => void;
  onCancel?: () => void;
}

// 등록과 수정이 같은 입력칸(별점 + 후기)을 쓰므로 폼을 하나로 묶었어요.
function RatingForm({
  initialRating,
  submitLabel,
  isPending,
  onSubmit,
  onCancel,
}: RatingFormProps) {
  // 입력값은 서버에 보내기 전까지 이 폼에서만 쓰는 클라이언트 상태예요.
  const [score, setScore] = useState(initialRating?.score ?? 0);
  const [comment, setComment] = useState(initialRating?.comment ?? "");

  // 백엔드 규칙: 별점은 1~5 정수, 후기는 500자 이하
  const canSubmit = score >= 1 && score <= 5 && comment.length <= 500;

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || isPending) return;

    const trimmed = comment.trim();
    // 후기를 비워 두면 comment를 아예 보내지 않아요(선택 항목).
    onSubmit({ score, comment: trimmed ? trimmed : undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-1" role="radiogroup" aria-label="별점">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={score === value}
            aria-label={`${value}점`}
            onClick={() => setScore(value)}
            className={`text-2xl ${value <= score ? "text-yellow-500" : "text-gray-300"}`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="후기를 남겨 주세요. (선택, 500자 이하)"
        maxLength={500}
        rows={3}
        className="rounded-lg border border-gray-300 p-3 text-sm"
      />

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!canSubmit || isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isPending ? "저장 중" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
          >
            취소
          </button>
        )}
      </div>
    </form>
  );
}
