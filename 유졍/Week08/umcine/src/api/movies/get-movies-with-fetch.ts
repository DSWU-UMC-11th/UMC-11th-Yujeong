// 4.1. fetch 요청 함수 작성하기

import { env } from "../../config/env";
import type { TmdbMovieListResponse } from "./models";

type GetMoviesWithFetchResponse = TmdbMovieListResponse;

async function getMoviesWithFetch(
  page = 1,
): Promise<GetMoviesWithFetchResponse> {
  const searchParams = new URLSearchParams({
    language: "ko-KR",
    page: String(page),
  });

  const response = await fetch(
    `${env.tmdbApiBaseUrl}/movie/popular?${searchParams}`,
    {
      headers: {
        Authorization: `Bearer ${env.tmdbAccessToken}`,
      },
    },
  );

  // 자바스크립트에서 ${...}에 변수 값을 넣으려면 일반 따옴표가 아닌 키보드 1 왼쪽(Esc 키 아래)에 있는 백틱(`)을 사용해야 합니다.
  if (!response.ok) {
    throw new Error(`영화 목록 요청에 실패했어요: ${response.status}`);
  }

  return response.json();
}

export { getMoviesWithFetch, type GetMoviesWithFetchResponse };

// 이 예제에서는 JSON을 반환하는 TMDB endpoint를 사용하므로 Accept를 따로 설정하지 않고 요청에 필요한 Authorization만 보냄.
// fetch는 네트워크 자체가 실패하면 Promise를 reject하지만 404나 500 응답만으로는 reject하지 않음. 따라서 response.ok를 직접 확인해야함.
// fetch의 response.json()만으로는 원하는 응답 타입을 알 수 없어서 함수에 Promise<GetMoviesWithFetchResponse>를 명시.
// 이 타입도 실제 JSON 구조를 검사하지는 않으므로 3.2에서 작성한 모델과 Network 패널의 응답을 함께 확인.
