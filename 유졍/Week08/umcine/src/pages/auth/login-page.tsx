import { useState } from "react";
import { Link } from "@tanstack/react-router";
import "./signup-page.css";
// [변경] login API를 직접 부르지 않고 로그인 mutation 훅을 사용해요.
import { useLoginMutation } from "@/hooks/use-login-mutation";

// [추가] 이메일 형식 검사
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
  // 입력값 상태
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // [변경] isSubmitting, navigate 제거
  // 요청 중 여부는 loginMutation.isPending으로 확인하고,
  // 토큰 저장, 알림, 홈 이동은 useLoginMutation이 담당해요.
  const loginMutation = useLoginMutation();

  // [추가] 이메일 형식이 맞고 비밀번호가 입력돼야 제출 가능
  const canSubmit =
    EMAIL_REGEX.test(form.email.trim()) && form.password.length > 0;

  // 입력값 변경 처리
  const handleChangeField = (key: "email" | "password", value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // [변경] 로그인 제출
  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault(); // 페이지 새로고침 막기
    if (!canSubmit || loginMutation.isPending) return; // 중복 제출 막기

    loginMutation.mutate({
      email: form.email.trim(),
      password: form.password,
    });
  };

  return (
    <div className="signup-page">
      {/* 헤더 */}
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
            <Link to="/signup" className="signup-login-button">
              회원가입
            </Link>
          </div>
        </div>
      </header>

      {/* 로그인 */}
      <main className="signup-main">
        <section className="signup-card">
          <h1>로그인</h1>

          <form onSubmit={handleSubmit} noValidate>
            <div className="signup-field">
              <label htmlFor="login-email">이메일</label>
              <input
                id="login-email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                value={form.email}
                onChange={(e) => handleChangeField("email", e.target.value)}
              />
            </div>

            <div className="signup-field">
              <label htmlFor="login-password">비밀번호</label>
              <input
                id="login-password"
                type="password"
                placeholder="비밀번호 입력"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => handleChangeField("password", e.target.value)}
              />
            </div>

            {/* [변경] 조건 미충족 또는 요청 중이면 비활성화 */}
            <button
              type="submit"
              className="signup-submit-button"
              disabled={!canSubmit || loginMutation.isPending}
            >
              {loginMutation.isPending ? "로그인 중" : "로그인"}
            </button>
          </form>

          <p className="signup-bottom-text">
            아직 계정이 없나요? <Link to="/signup">회원가입</Link>
          </p>
        </section>
      </main>
    </div>
  );
}
