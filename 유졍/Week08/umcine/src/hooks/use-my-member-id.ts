import { useAuthStore } from "../stores/auth-store";
import { getMemberIdFromToken } from "../utils/get-member-id-from-token";

// 로그인한 회원의 ID (로그인 전이거나 토큰이 이상하면 null)
// 토큰이 바뀌면(로그인/로그아웃) store를 구독하고 있어서 자동으로 다시 계산돼요.
export function useMyMemberId() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return getMemberIdFromToken(accessToken);
}
