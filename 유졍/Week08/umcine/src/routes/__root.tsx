import {
  createRootRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { Header } from "../components/layout/header";
import { Footer } from "../components/layout/footer";

function RootLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const hideHeader = pathname === "/login" || pathname === "/signup";

  return (
    // [변경] 화면 전체 높이를 채우는 세로 레이아웃이에요.
    // 가운데 영역(flex-1)이 남는 높이를 차지해서, 내용이 짧아도 푸터가 맨 아래에 붙어요.
    <div className="flex min-h-screen flex-col bg-[#f5f6f8]">
      {!hideHeader && <Header />}
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
      {/* [추가] TMDB 출처 표기 푸터 (로그인/회원가입 화면에서는 헤더처럼 숨겨요) */}
      {!hideHeader && <Footer />}
    </div>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => <main>페이지를 찾을 수 없어요.</main>,
});
