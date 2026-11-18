import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { getMovies } from "../../api/movies/get-movies";
import { PosterCard } from "@/components/movies/poster-card";
import { Pagination } from "@/components/movies/pagination";

// TMDB는 page를 최대 500까지만 받아요.
const TMDB_MAX_PAGE = 500;

export function MovieListPage() {
  // [변경] useState 대신 주소의 ?page 값을 써요. (검색 페이지와 같은 방식)
  const { page = 1 } = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });

  const moviesQuery = useQuery({
    queryKey: ["movies", "list", { page }],
    queryFn: () => getMovies({ page }),
    // 다음 페이지를 받는 동안 이전 목록을 계속 보여 줘서 화면이 깜빡이지 않아요.
    placeholderData: keepPreviousData,
  });

  const movies = moviesQuery.data?.results ?? [];
  const totalPages = Math.min(moviesQuery.data?.total_pages ?? 0, TMDB_MAX_PAGE);

  const handlePageChange = (nextPage: number) => {
    navigate({ search: { page: nextPage > 1 ? nextPage : undefined } });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="mx-auto w-full max-w-[1200px] px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900">인기 영화</h1>
      <p className="mt-2 text-sm text-gray-500">지금 많이 찾는 영화를 둘러보세요.</p>

      <section className="mt-8">
        {moviesQuery.isPending ? (
          <p className="py-16 text-center text-gray-500">영화 목록을 불러오는 중이에요.</p>
        ) : moviesQuery.isError ? (
          <p className="py-16 text-center text-red-500">영화 목록을 불러오지 못했어요.</p>
        ) : movies.length === 0 ? (
          <p className="py-16 text-center text-gray-500">조건에 맞는 영화가 없어요.</p>
        ) : (
          <>
            {/* [변경] 줄글 목록 → 포스터 카드 그리드 (마이페이지, 검색과 같은 카드) */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {movies.map((movie) => (
                <PosterCard
                  key={movie.id}
                  movieId={movie.id}
                  title={movie.title}
                  posterPath={movie.poster_path}
                  releaseDate={movie.release_date}
                />
              ))}
            </div>

            <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
          </>
        )}
      </section>
    </main>
  );
}
