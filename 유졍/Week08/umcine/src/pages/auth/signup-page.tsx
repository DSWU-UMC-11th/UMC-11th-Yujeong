import { useState } from "react";
import { Link } from "@tanstack/react-router";
import "./signup-page.css";

import { checkEmailDuplicate } from "../../api/members/check-email-duplicate";
import { checkNicknameDuplicate } from "../../api/members/check-nickname-duplicate";
// [변경] 기존 signup API 함수 대신 회원가입 mutation 훅을 가져와요.
// ※ 실제 훅 파일 위치에 맞게 경로를 확인해 주세요.
import { useSignupMutation } from "../../hooks/use-signup-mutation";

// 중복 확인 상태의 초기값 (확인 중 여부, 사용 가능 여부)
const DEFAULT_DUPLICATE_CHECK = {
  isChecking: false,
  isAvailable: false,
};

type DuplicateCheckKey = "email" | "nickname";

// 이메일: "아무문자@아무문자.아무문자" 형식
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 비밀번호: 영문 소문자, 대문자, 숫자, 특수문자(!@#$%^&*)를 모두 포함한 8자 이상
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;

// 폼 입력값의 초기값
const DEFAULT_FORM = {
  email: "",
  nickname: "",
  password: "",
  passwordConfirm: "",
};

type DefaultFormKey = keyof typeof DEFAULT_FORM;
type DefaultFormValue = (typeof DEFAULT_FORM)[DefaultFormKey];

export function SignupPage() {
  // 입력값 상태
  const [form, setForm] = useState(DEFAULT_FORM);

  // 이메일, 닉네임 각각의 중복 확인 상태
  const [duplicateCheck, setDuplicateCheck] = useState({
    email: DEFAULT_DUPLICATE_CHECK,
    nickname: DEFAULT_DUPLICATE_CHECK,
  });

  // [변경] isSubmitting 상태를 직접 관리하지 않아요.
  // 요청 진행 여부는 mutation이 isPending으로 알려 줘요.
  // 성공/실패 시 처리(알림, 로그인 페이지 이동)도 훅 안에서 담당해요.
  const signupMutation = useSignupMutation();

  // ----- 입력값 유효성 검사 -----
  const isEmailValid = EMAIL_REGEX.test(form.email.trim());
  const isNicknameValid =
    form.nickname.trim().length >= 2 && form.nickname.trim().length <= 12;
  const isPasswordValid = PASSWORD_REGEX.test(form.password);
  const isPasswordConfirmValid =
    form.passwordConfirm.length > 0 && form.password === form.passwordConfirm;

  // 입력을 시작했는데 형식이 틀렸을 때만 에러 문구를 보여 줘요.
  const showEmailError = form.email.length > 0 && !isEmailValid;
  const showNicknameError = form.nickname.length > 0 && !isNicknameValid;
  const showPasswordError = form.password.length > 0 && !isPasswordValid;
  const showPasswordConfirmError =
    form.passwordConfirm.length > 0 && !isPasswordConfirmValid;

  // 모든 입력값의 형식이 올바른지
  const isFormValid =
    isEmailValid &&
    isNicknameValid &&
    isPasswordValid &&
    isPasswordConfirmValid;

  // 형식 검사 + 이메일/닉네임 중복 확인까지 통과해야 가입 가능
  const canSubmit =
    isFormValid &&
    duplicateCheck.email.isAvailable &&
    duplicateCheck.nickname.isAvailable;

  // 입력값 변경 처리
  const handleChangeField = (key: DefaultFormKey, value: DefaultFormValue) => {
    if (key === "email" || key === "nickname") {
      // 중복 확인 중에는 값을 바꾸지 못하게 막아요.
      if (duplicateCheck[key].isChecking) return;
      // 값이 바뀌면 이전 중복 확인 결과는 무효이므로 초기화해요.
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: DEFAULT_DUPLICATE_CHECK,
      }));
    }

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // 이메일/닉네임 중복 확인 요청
  const handleCheckDuplicate = async (key: DuplicateCheckKey) => {
    const isValid = key === "email" ? isEmailValid : isNicknameValid;
    // 형식이 틀렸거나 이미 확인 중이면 요청하지 않아요.
    if (!isValid || duplicateCheck[key].isChecking) return;

    const label = key === "email" ? "이메일" : "닉네임";

    // 확인 시작: 버튼을 "확인 중"으로 바꾸고 입력을 잠가요.
    setDuplicateCheck((prev) => ({
      ...prev,
      [key]: { isChecking: true, isAvailable: false },
    }));

    try {
      const response =
        key === "email"
          ? await checkEmailDuplicate(form.email.trim())
          : await checkNicknameDuplicate(form.nickname.trim());

      const isAvailable = response.isAvailable;

      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: { ...prev[key], isAvailable },
      }));

      alert(
        isAvailable
          ? `사용할 수 있는 ${label}이에요.`
          : `이미 사용 중인 ${label}이에요.`,
      );
    } catch {
      // 요청 실패 시 사용 불가로 처리해요.
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: { ...prev[key], isAvailable: false },
      }));
      alert("중복 확인에 실패했어요. 다시 시도해 주세요.");
    } finally {
      // 성공/실패와 상관없이 "확인 중" 상태를 해제해요.
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: { ...prev[key], isChecking: false },
      }));
    }
  };

  // [변경] 회원가입 제출: form의 onSubmit 이벤트를 직접 받아요.
  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    // 브라우저 기본 동작(페이지 새로고침)을 막아요.
    event.preventDefault();

    // 가입 조건을 못 채웠거나 이미 요청 중이면 중복 제출을 막아요.
    if (!canSubmit || signupMutation.isPending) return;

    // mutation 실행: 성공/실패 후 처리는 useSignupMutation이 담당해요.
    signupMutation.mutate({
      email: form.email.trim(),
      nickname: form.nickname.trim(),
      password: form.password,
    });
  };

  return (
    <div className="signup-page">
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
            <Link to="/login" className="signup-login-button">
              로그인
            </Link>
          </div>
        </div>
      </header>

      <main className="signup-main">
        <section className="signup-card">
          <h1>회원가입</h1>

          {/* [변경] handleSubmit이 이벤트를 직접 받으므로 그대로 연결해요. */}
          <form onSubmit={handleSubmit} noValidate>
            {/* 이메일 입력 + 중복 확인 */}
            <div className="signup-field">
              <label htmlFor="email">이메일</label>
              <div className="signup-input-with-button">
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  disabled={duplicateCheck.email.isChecking}
                  onChange={(e) => handleChangeField("email", e.target.value)}
                />
                <button
                  type="button"
                  className="signup-check-button"
                  disabled={!isEmailValid || duplicateCheck.email.isChecking}
                  onClick={() => handleCheckDuplicate("email")}
                >
                  {duplicateCheck.email.isChecking ? "확인 중" : "중복 확인"}
                </button>
              </div>
              {showEmailError && (
                <p className="signup-error">
                  올바른 이메일 형식을 입력해주세요.
                </p>
              )}
              {duplicateCheck.email.isAvailable && (
                <p className="signup-success">사용 가능한 이메일입니다.</p>
              )}
            </div>

            {/* 닉네임 입력 + 중복 확인 */}
            <div className="signup-field">
              <label htmlFor="nickname">닉네임</label>
              <div className="signup-input-with-button">
                <input
                  id="nickname"
                  type="text"
                  placeholder="2~12자"
                  value={form.nickname}
                  disabled={duplicateCheck.nickname.isChecking}
                  onChange={(e) =>
                    handleChangeField("nickname", e.target.value)
                  }
                />
                <button
                  type="button"
                  className="signup-check-button"
                  disabled={
                    !isNicknameValid || duplicateCheck.nickname.isChecking
                  }
                  onClick={() => handleCheckDuplicate("nickname")}
                >
                  {duplicateCheck.nickname.isChecking ? "확인 중" : "중복 확인"}
                </button>
              </div>
              {showNicknameError && (
                <p className="signup-error">닉네임은 2~12자로 입력해주세요.</p>
              )}
              {duplicateCheck.nickname.isAvailable && (
                <p className="signup-success">사용 가능한 닉네임입니다.</p>
              )}
            </div>

            {/* 비밀번호 입력 */}
            <div className="signup-field">
              <label htmlFor="password">비밀번호</label>
              <input
                id="password"
                type="password"
                placeholder="8자 이상"
                value={form.password}
                onChange={(e) => handleChangeField("password", e.target.value)}
              />
              <p className="signup-help">
                영문 대소문자, 숫자, 특수문자를 모두 포함해 8자 이상 입력해
                주세요
              </p>
              {showPasswordError && (
                <p className="signup-error">비밀번호 조건을 확인해주세요.</p>
              )}
            </div>

            {/* 비밀번호 확인 입력 */}
            <div className="signup-field">
              <label htmlFor="passwordConfirm">비밀번호 확인</label>
              <input
                id="passwordConfirm"
                type="password"
                placeholder="다시 입력"
                value={form.passwordConfirm}
                onChange={(e) =>
                  handleChangeField("passwordConfirm", e.target.value)
                }
              />
              {showPasswordConfirmError && (
                <p className="signup-error">비밀번호가 일치하지 않습니다.</p>
              )}
            </div>

            {/* [변경] isSubmitting 대신 signupMutation.isPending으로 요청 중 상태를 표시해요. */}
            <button
              type="submit"
              className="signup-submit-button"
              disabled={!canSubmit || signupMutation.isPending}
            >
              {signupMutation.isPending ? "가입 중" : "가입하기"}
            </button>
          </form>

          <p className="signup-bottom-text">
            이미 계정이 있나요? <Link to="/login">로그인</Link>
          </p>
        </section>
      </main>
    </div>
  );
}
