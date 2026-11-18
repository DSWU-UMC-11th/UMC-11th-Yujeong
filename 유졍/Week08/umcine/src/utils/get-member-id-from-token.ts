// 토큰(JWT)에서 회원 ID를 꺼내요.
//
// 왜 필요할까요?
// GET /members/{memberId}/ratings 는 주소에 memberId가 필요한데,
// 로그인 응답과 내 정보 조회 응답에는 memberId가 없어요.
// 대신 백엔드가 토큰을 만들 때 payload의 sub에 memberId를 넣어 두었어요.
//
// JWT는 "헤더.payload.서명" 세 부분으로 되어 있고, payload는 base64url로 인코딩된 JSON이에요.
// 여기서는 화면에 쓸 값을 읽기만 하고, 토큰이 진짜인지(서명) 검증하지는 않아요.
// 검증은 서버가 요청을 받을 때마다 하므로, 프론트에서 꺼낸 값을 믿고 권한을 판단하면 안 돼요.
export function getMemberIdFromToken(token: string | null): number | null {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    // base64url → base64 로 바꾸고 길이를 4의 배수로 맞춘 뒤 디코딩해요.
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const { sub } = JSON.parse(atob(padded)) as { sub?: unknown };

    const memberId = Number(sub);
    return Number.isInteger(memberId) && memberId > 0 ? memberId : null;
  } catch {
    // 형식이 깨진 토큰이면 회원 ID를 알 수 없는 것으로 처리해요.
    return null;
  }
}
