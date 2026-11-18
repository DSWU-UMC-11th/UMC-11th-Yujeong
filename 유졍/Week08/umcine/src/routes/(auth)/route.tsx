import {
  createFileRoute,
  Navigate,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth-store";

// (auth) 폴더는 Route Group이에요.
// 괄호로 감싼 폴더 이름은 URL에 들어가지 않아서, 이 안의 페이지 주소는 그대로 /my, /my/edit예요.
// 이 route.tsx는 그룹 안의 모든 페이지를 감싸는 공통 Layout Route예요.
export const Route = createFileRoute("/(auth)")({
  // 페이지를 보여 주기 전에 실행돼요.
  // 토큰이 없으면(로그인 전) 하위 페이지를 그리지 않고 로그인 페이지로 보내요.
  beforeLoad: () => {
    if (!useAuthStore.getState().accessToken) {
      throw redirect({ to: "/login" });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  // beforeLoad는 "페이지에 들어올 때" 한 번만 검사해요.
  // 페이지에 머무는 동안 토큰이 사라지는 경우(401 응답으로 authApi가 토큰을 비움)도
  // 로그인 페이지로 보내기 위해 store를 구독해서 한 번 더 확인해요.
  const accessToken = useAuthStore((state) => state.accessToken);

  if (!accessToken) {
    return <Navigate to="/login" />;
  }

  // 그룹 안의 하위 페이지(/my, /my/edit)가 이 자리에 그려져요.
  return <Outlet />;
}
