import { createFileRoute } from "@tanstack/react-router";
import { MovieListPage } from "@/pages/movies/movie-list-page";

// 홈(/)은 영화 목록이에요.
// [추가] 페이지 번호를 주소(/?page=2)에 담아서, 새로고침하거나 뒤로 가기를 해도 보던 페이지가 유지돼요.
interface MovieListSearch {
  page?: number;
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): MovieListSearch => {
    const page = Number(search.page);
    // 1페이지는 주소에 안 붙이고(?page 생략), 숫자가 아니거나 1 이하이면 무시해요.
    return { page: Number.isInteger(page) && page > 1 ? page : undefined };
  },
  component: MovieListPage,
});
