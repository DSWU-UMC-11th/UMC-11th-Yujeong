// query key를 한곳에 모아 두면, 조회하는 곳과 갱신(invalidate/setQueryData)하는 곳에서
// 같은 key를 오타 없이 쓸 수 있어요.

export const favoriteKeys = {
  // 내 즐겨찾기 목록: GET /favorites
  list: () => ["favorites", "list"] as const,
  // 특정 영화의 즐겨찾기 여부: GET /favorites/{movieId}
  status: (movieId: number) => ["favorites", "status", movieId] as const,
};

export const ratingKeys = {
  // 회원이 남긴 평점 목록: GET /members/{memberId}/ratings
  byMember: (memberId: number) => ["members", memberId, "ratings"] as const,
};

export const movieKeys = {
  // TMDB 영화 상세 (영화 상세 페이지와 마이페이지 즐겨찾기 목록이 같은 캐시를 써요)
  detail: (movieId: number) => ["movies", "detail", movieId] as const,
};
