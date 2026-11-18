export interface Movie {
  id: number;
  title: string;
  releaseDate: string;
  originalTitle?: string;
  posterPath?: string;
  backdropPath?: string;
  genres?: string[];
  runtime?: string;
  tagline?: string;
  overview?: string;
}
