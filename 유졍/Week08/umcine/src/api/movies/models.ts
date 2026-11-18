// 응답마다 필드 구성이 다르므로 타입을 세 가지로 나눔.

// TmdbMovie: 목록과 상세 응답에 공통으로 들어오는 필드를 표현

// TmdbMovieListItem: 목록과 검색 응답의 results 항목을 표현.
// genre_ids가 들어 있으며 목록과 검색 카드에서 사용.

// TmdbMovieDetail: 상세 응답을 표현.
// genres, runtime, tagline이 들어 있으며 상세 화면에서 사용.

interface TmdbMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
}

interface TmdbMovieListItem extends TmdbMovie {
  genre_ids: number[];
}

interface TmdbMovieListResponse {
  page: number;
  results: TmdbMovieListItem[];
  total_pages: number;
  total_results: number;
}

interface TmdbGenre {
  id: number;
  name: string;
}

interface TmdbMovieDetail extends TmdbMovie {
  genres: TmdbGenre[];
  runtime: number | null;
  tagline: string;
}

export type {
  TmdbGenre,
  TmdbMovie,
  TmdbMovieDetail,
  TmdbMovieListItem,
  TmdbMovieListResponse,
};

// 서버가 보내는 JSON과 비교하기 쉽도록 프로퍼티 이름은 snake_case 그대로 작성
