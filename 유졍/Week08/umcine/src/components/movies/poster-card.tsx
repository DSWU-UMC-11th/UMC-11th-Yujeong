import { Link } from "@tanstack/react-router";
import { getTmdbPosterUrl } from "@/utils/movies/tmdb-image";
import { formatDate } from "@/utils/format-date";

interface PosterCardProps {
  movieId: number;
  // 제목/포스터/개봉일은 TMDB에서 받아오는 중이면 아직 없을 수 있어요.
  title?: string;
  posterPath?: string | null;
  releaseDate?: string;
}

// 포스터 + 제목 + 개봉일 카드 (마이페이지 즐겨찾기, 검색 결과에서 같이 써요)
// 카드 전체가 영화 상세 페이지로 가는 링크예요.
export function PosterCard({
  movieId,
  title,
  posterPath,
  releaseDate,
}: PosterCardProps) {
  const posterUrl = getTmdbPosterUrl(posterPath ?? null);

  return (
    <Link
      to="/movies/$movieId"
      params={{ movieId: String(movieId) }}
      className="group flex flex-col"
    >
      <div className="aspect-[2/3] overflow-hidden rounded-lg bg-gray-200">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={`${title ?? "영화"} 포스터`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            {title === undefined ? "불러오는 중" : "포스터 없음"}
          </div>
        )}
      </div>

      <p className="mt-2 truncate text-sm font-semibold text-gray-900">
        {title ?? " "}
      </p>
      <p className="mt-0.5 text-xs text-gray-400">{formatDate(releaseDate)}</p>
    </Link>
  );
}
