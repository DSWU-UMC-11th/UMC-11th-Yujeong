// "2026-07-29" → "2026.07.29"
// TMDB 개봉일처럼 "YYYY-MM-DD" 문자열을 화면용 형식으로 바꿔요. 값이 없으면 빈 문자열이에요.
export function formatDate(date: string | null | undefined) {
  if (!date) return "";
  return date.slice(0, 10).replaceAll("-", ".");
}
