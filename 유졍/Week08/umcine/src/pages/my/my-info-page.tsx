import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueries, useQuery } from "@tanstack/react-query";
import { getMe } from "@/api/members/me";
import { getFavorites } from "@/api/favorites/get-favorites";
import { getMovieDetail } from "@/api/movies/get-movie-detail";
import { favoriteKeys, movieKeys } from "@/api/query-keys";
import { useAuthStore } from "@/stores/auth-store";
import { PosterCard } from "@/components/movies/poster-card";
import { Pagination } from "@/components/movies/pagination";
import { PersonIcon } from "@/components/common/icons";

// 즐겨찾기를 한 페이지에 몇 개씩 보여 줄지 (5개씩 2줄)
const FAVORITES_PER_PAGE = 10;

export function MyInfoPage() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);

  // 내 정보: 헤더/정보 수정과 같은 key라서 캐시를 함께 써요.
  const meQuery = useQuery({
    queryKey: ["members", "me"],
    queryFn: getMe,
    enabled: Boolean(accessToken),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // 내 즐겨찾기 목록: GET /favorites → [{ favoriteId, movieId, createdAt }]
  const favoritesQuery = useQuery({
    queryKey: favoriteKeys.list(),
    queryFn: getFavorites,
    enabled: Boolean(accessToken),
  });

  const favorites = favoritesQuery.data ?? [];

  // [추가] 페이지네이션: 서버는 목록을 한 번에 주므로, 화면에서 잘라서 보여 줘요.
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(favorites.length / FAVORITES_PER_PAGE));
  // 즐겨찾기를 해제해서 마지막 페이지가 사라져도 빈 화면이 되지 않게 범위를 맞춰요.
  const currentPage = Math.min(page, totalPages);
  const pageItems = favorites.slice(
    (currentPage - 1) * FAVORITES_PER_PAGE,
    currentPage * FAVORITES_PER_PAGE,
  );

  // 서버는 movieId만 주므로 제목/포스터/개봉일은 TMDB 상세에서 가져와요.
  // 지금 페이지에 보이는 영화만 조회해서 요청 수를 줄여요.
  // key가 영화 상세 페이지와 같아서 이미 본 영화는 캐시를 그대로 써요.
  const movieQueries = useQueries({
    queries: pageItems.map((favorite) => ({
      queryKey: movieKeys.detail(favorite.movieId),
      queryFn: () => getMovieDetail(favorite.movieId),
      staleTime: 1000 * 60 * 5,
    })),
  });

  if (meQuery.isLoading) {
    return (
      <main className="mx-auto w-full max-w-[1200px] px-6 py-10">
        <p className="py-20 text-center text-gray-500">내 정보를 불러오는 중...</p>
      </main>
    );
  }

  const userInfo = meQuery.data;

  return (
    <main className="mx-auto w-full max-w-[1200px] px-6 py-10">
      {/* 제목 + 정보 수정 버튼 */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">내 정보</h1>
        <button
          type="button"
          onClick={() => navigate({ to: "/my/edit" })}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          정보 수정
        </button>
      </div>

      {/* 기본 정보 */}
      <section className="mt-8 border-y border-gray-200 py-6">
        <h2 className="text-lg font-bold text-gray-900">기본 정보</h2>

        <div className="mt-4 flex items-center gap-12">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-800">
            <PersonIcon className="h-9 w-9" />
          </div>

          <dl className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-gray-400">닉네임</dt>
              <dd className="mt-1 font-semibold text-gray-900">
                {userInfo?.nickname || "닉네임 없음"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">이메일</dt>
              <dd className="mt-1 font-semibold text-gray-900">
                {userInfo?.email || "이메일 없음"}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* 내 즐겨찾기 */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-gray-900">내 즐겨찾기</h2>

        {favoritesQuery.isPending ? (
          <p className="py-16 text-center text-gray-500">즐겨찾기 영화를 불러오는 중...</p>
        ) : favoritesQuery.isError ? (
          <p className="py-16 text-center text-red-500">즐겨찾기 목록을 불러오지 못했어요.</p>
        ) : favorites.length === 0 ? (
          <p className="py-16 text-center text-gray-500">즐겨찾기한 영화가 없습니다.</p>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {pageItems.map((favorite, index) => {
                // pageItems와 movieQueries는 같은 순서라 index로 짝을 맞춰요.
                const movie = movieQueries[index]?.data;
                return (
                  <PosterCard
                    key={favorite.favoriteId}
                    movieId={favorite.movieId}
                    title={movie?.title}
                    posterPath={movie?.poster_path}
                    releaseDate={movie?.release_date}
                  />
                );
              })}
            </div>

            <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </section>
    </main>
  );
}
