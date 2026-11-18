import { apiClient } from "../api-client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  nickname: string;
  accessToken: string;
}

interface LoginApiResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: LoginResponse;
}

export function login(data: LoginRequest): Promise<LoginResponse> {
  return apiClient
    .post("auth/login", { json: data })
    .json<LoginApiResponse>()
    .then((response) => {
      if (!response.isSuccess || !response.result?.accessToken) {
        throw new Error("로그인 응답에 토큰이 없습니다.");
      }

      return response.result;
    });
}
