import { BookmarkButton } from "../bookmark-button";
import { cn } from "../../utils/cn";

interface MovieCardProps {
  id: number;
  title: string;
  posterPath?: string;
  className?: string;
}

export function MovieCard({
  id,
  title,
  posterPath,
  className,
}: MovieCardProps) {
  return (
    <div className={cn("movie-card", className)}>
      {posterPath && (
        <img src={posterPath} alt={title} />
      )}

      <h2>{title}</h2>

      <BookmarkButton movieId={id} />
    </div>
  );
}