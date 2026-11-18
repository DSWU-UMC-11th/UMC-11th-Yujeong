import { Link } from "@tanstack/react-router";
import "../../pages/auth/signup-page.css";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/api/members/me";
import { useAuthStore } from "@/stores/auth-store";

export function Header() {
  // ① 여기에 추가: return 위
  // 저장소에서 토큰을 꺼내요. 토큰이 있으면 로그인한 상태예요.
  const accessToken = useAuthStore((state) => state.accessToken);

  // 내 정보 조회
  const meQuery = useQuery({
    queryKey: ["members", "me"], // 캐시를 구분하는 이름
    queryFn: getMe, // 실제로 호출할 API 함수
    enabled: Boolean(accessToken), // 토큰이 있을 때만 요청해요.
    staleTime: 5 * 60 * 1000, // 5분 동안은 다시 요청하지 않고 캐시를 써요.
    retry: false, // 인증 실패 시 자동 재시도하지 않아요.
  });

  return (
    <header className="signup-header">
      <div className="signup-header-inner">
        <Link to="/" className="signup-logo">
          <span className="signup-logo-icon">▣</span>
          <span>UMCine</span>
        </Link>

        <nav className="signup-nav">
          <Link to="/">영화</Link>
          <Link to="/search">검색</Link>
          <Link to="/my">내 정보</Link>
        </nav>

        <div className="signup-header-actions">
          <Link to="/search" className="signup-search-button">
            <span>⌕</span>
          </Link>

          {/* ② 여기를 교체: 기존 로그인 링크 자리 */}
          {!accessToken ? (
            // 로그인 전: 로그인 링크
            <Link to="/login" className="signup-login-button">
              로그인
            </Link>
          ) : meQuery.isLoading ? (
            // 내 정보 조회 중: 버튼 크기의 로딩 표시
            <span className="h-10 w-24 animate-pulse rounded-lg bg-gray-200" />
          ) : (
            // 토큰이 있고 조회가 끝남: 마이페이지 링크
            <Link to="/my" className="signup-login-button">
              마이페이지
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
