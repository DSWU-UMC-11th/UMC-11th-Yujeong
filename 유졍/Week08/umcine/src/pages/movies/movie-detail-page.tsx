import { Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getMovieDetail } from "../../api/movies/get-movie-detail";
import { movieKeys } from "@/api/query-keys";
import { FavoriteButton } from "@/components/movies/favorite-button";
import { MyRatingSection } from "@/components/movies/my-rating-section";
import { useAuthStore } from "@/stores/auth-store";
import { useMyMemberId } from "@/hooks/use-my-member-id";
import { getTmdbBackdropUrl, getTmdbPosterUrl } from "@/utils/movies/tmdb-image";
import { formatDate } from "@/utils/format-date";

export function MovieDetailPage() {
  const { movieId: movieIdParam } = useParams({
    from: "/movies/$movieId",
  });

  const movieId = Number(movieIdParam);
  const isValidMovieId = Number.isInteger(movieId) && movieId > 0;

  // 로그인 여부와 내 회원 ID (즐겨찾기/평점은 로그인한 회원만 쓸 수 있어요)
  const accessToken = useAuthStore((state) => state.accessToken);
  const memberId = useMyMemberId();

  const movieDetailQuery = useQuery({
    // 마이페이지 즐겨찾기 목록과 같은 key라서 캐시를 같이 써요.
    queryKey: movieKeys.detail(movieId),
    queryFn: () => getMovieDetail(movieId),
    enabled: isValidMovieId,
    staleTime: 1000 * 60 * 5,
  });

  if (!isValidMovieId) {
    return <StatusMessage>올바르지 않은 영화 번호예요.</StatusMessage>;
  }

  if (movieDetailQuery.isPending) {
    return <StatusMessage>영화 상세 정보를 불러오는 중이에요.</StatusMessage>;
  }

  if (movieDetailQuery.isError) {
    return <StatusMessage>영화 상세 정보를 불러오지 못했어요.</StatusMessage>;
  }

  const movie = movieDetailQuery.data;
  const backdropUrl = getTmdbBackdropUrl(movie.backdrop_path);
  const posterUrl = getTmdbPosterUrl(movie.poster_path);

  // [추가] 개봉일 · 장르 · 러닝타임을 한 줄로 보여 주기 위해, 값이 있는 것만 모아요.
  const metaItems = [
    formatDate(movie.release_date),
    movie.genres?.map((genre) => genre.name).join(", "),
    movie.runtime ? `${movie.runtime}분` : "",
  ].filter(Boolean);

  return (
    <main className="pb-16">
      {/* ① 배경 이미지(backdrop) 배너
          아래쪽을 페이지 배경색으로 흐리게 덮어서(gradient) 본문과 자연스럽게 이어지게 해요. */}
      <div className="relative h-64 overflow-hidden bg-gray-900 md:h-96">
        {backdropUrl && (
          <img
            src={backdropUrl}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover opacity-70"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#f5f6f8] via-[#f5f6f8]/40 to-transparent" />
      </div>

      {/* ② 포스터 + 정보
          -mt로 위로 끌어올려서 포스터가 배너에 걸쳐 보이게 해요. */}
      <div className="relative mx-auto -mt-40 w-full max-w-[1200px] px-6 md:-mt-56">
        {/* 배경 이미지 위에 있어서 흰 글자 + 그림자로 잘 보이게 해요. */}
        <Link to="/" className="text-sm font-semibold text-white drop-shadow hover:underline">
          ← 영화 목록
        </Link>

        <div className="mt-4 flex flex-col gap-8 md:flex-row">
          {/* 포스터 */}
          <div className="w-44 shrink-0 md:w-64">
            <div className="aspect-[2/3] overflow-hidden rounded-xl bg-gray-200 shadow-xl">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={`${movie.title} 포스터`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  포스터 없음
                </div>
              )}
            </div>
          </div>

          {/* 정보 */}
          <div className="flex-1 md:pt-40">
            <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">{movie.title}</h1>
            {movie.original_title && movie.original_title !== movie.title && (
              <p className="mt-1 text-gray-500">{movie.original_title}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
              {metaItems.map((item, index) => (
                <span key={index} className="flex items-center gap-3">
                  {index > 0 && <span className="text-gray-300">·</span>}
                  {item}
                </span>
              ))}
              {movie.vote_count > 0 && (
                <span className="flex items-center gap-1 font-semibold text-gray-900">
                  <span className="text-yellow-500">★</span>
                  {movie.vote_average.toFixed(1)}
                  <span className="font-normal text-gray-400">
                    ({movie.vote_count.toLocaleString()})
                  </span>
                </span>
              )}
            </div>

            {/* 즐겨찾기: 로그인했으면 버튼, 아니면 로그인 안내 */}
            <div className="mt-5">
              {accessToken ? (
                <FavoriteButton movieId={movie.id} />
              ) : (
                <p className="text-sm text-gray-500">
                  <Link to="/login" className="font-semibold text-blue-600 hover:underline">
                    로그인
                  </Link>
                  하면 즐겨찾기와 평점을 남길 수 있어요.
                </p>
              )}
            </div>

            {movie.tagline && (
              <p className="mt-8 text-lg font-semibold italic text-gray-800">
                “{movie.tagline}”
              </p>
            )}

            <h2 className="mt-6 text-lg font-bold text-gray-900">줄거리</h2>
            <p className="mt-2 leading-7 text-gray-700">
              {movie.overview || "등록된 줄거리가 없어요."}
            </p>
          </div>
        </div>

        {/* ③ 내 평점: 흰 카드로 구분해요. (회원 ID를 알 수 있을 때만) */}
        {accessToken && memberId !== null && (
          <div className="mt-12 rounded-xl border border-gray-200 bg-white p-6">
            <MyRatingSection memberId={memberId} movieId={movie.id} />
          </div>
        )}
      </div>
    </main>
  );
}

// 불러오는 중 / 오류 같은 안내 문구를 가운데에 보여 줘요.
function StatusMessage({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-[1200px] px-6 py-24 text-center text-gray-500">
      {children}
    </main>
  );
}
