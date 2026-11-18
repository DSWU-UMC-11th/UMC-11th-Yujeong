import { useNavigate, useSearch } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { searchMovies } from "../../api/movies/search-movies";
import { PosterCard } from "@/components/movies/poster-card";
import { Pagination } from "@/components/movies/pagination";

// TMDB는 page를 최대 500까지만 받아요.
const TMDB_MAX_PAGE = 500;

export function SearchPage() {
  const { query, page = 1 } = useSearch({ from: "/search" });
  const navigate = useNavigate({ from: "/search" });

  const normalizedQuery = query?.trim() ?? "";

  const searchQuery = useQuery({
    // [변경] 검색어와 페이지가 바뀌면 다른 캐시예요.
    queryKey: ["movies", "search", { query: normalizedQuery, page }],
    queryFn: () => searchMovies({ query: normalizedQuery, page }),
    enabled: normalizedQuery.length > 0,
    // 다음 페이지를 받는 동안 이전 결과를 계속 보여 줘서 화면이 깜빡이지 않아요.
    placeholderData: keepPreviousData,
  });

  const searchResults = searchQuery.data?.results ?? [];
  const totalResults = searchQuery.data?.total_results ?? 0;
  const totalPages = Math.min(searchQuery.data?.total_pages ?? 0, TMDB_MAX_PAGE);

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextQuery = String(
      new FormData(event.currentTarget).get("query") ?? "",
    ).trim();

    // 새로 검색하면 1페이지부터 보여 줘요(page를 지워요).
    navigate({ search: { query: nextQuery || undefined } });
  }

  function handlePageChange(nextPage: number) {
    // 검색어는 그대로 두고 page만 바꿔요.
    navigate({ search: (prev) => ({ ...prev, page: nextPage > 1 ? nextPage : undefined }) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900">영화 검색</h1>

      {/* 검색창 */}
      <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
        <input
          // 주소의 검색어가 바뀌면(뒤로 가기 등) 입력칸도 새 값으로 다시 그려요.
          key={query}
          aria-label="검색어"
          name="query"
          defaultValue={query ?? ""}
          placeholder="영화 제목을 입력해 주세요."
          className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          검색
        </button>
      </form>

      {/* 결과 영역 */}
      <section className="mt-8">
        {!normalizedQuery ? (
          <p className="py-16 text-center text-gray-500">검색어를 입력해 주세요.</p>
        ) : searchQuery.isLoading ? (
          <p className="py-16 text-center text-gray-500">검색 결과를 불러오는 중이에요.</p>
        ) : searchQuery.isError ? (
          <p className="py-16 text-center text-red-500">검색 결과를 불러오지 못했어요.</p>
        ) : searchResults.length === 0 ? (
          <p className="py-16 text-center text-gray-500">조건에 맞는 영화가 없어요.</p>
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg font-bold text-gray-900">‘{normalizedQuery}’ 검색 결과</h2>
              <span className="text-sm text-gray-400">{totalResults.toLocaleString()}편</span>
            </div>

            {/* [변경] 줄글 목록 → 포스터 카드 그리드 */}
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {searchResults.map((movie) => (
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
