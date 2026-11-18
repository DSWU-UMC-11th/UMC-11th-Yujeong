//search param은 /search?query=오디세이에서 query처럼 ? 뒤에 붙는 값

import { createFileRoute } from "@tanstack/react-router";
import { SearchPage } from "../pages/movies/search-page";

// query, page를 "선택 값(?)"으로 선언해야 <Link to="/search">처럼 search 없이도 이동할 수 있어요.
interface SearchParams {
  query?: string;
  page?: number;
}

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    // [추가] 페이지 번호도 주소(?page=2)에 담아요. 1보다 작거나 숫자가 아니면 무시해요.
    const page = Number(search.page);
    return {
      query: typeof search.query === "string" ? search.query : undefined,
      page: Number.isInteger(page) && page > 1 ? page : undefined,
    };
  },
  component: SearchPage,
});
