import { apiClient } from "../api-client";

export interface MyInfoResponse {
  id: number;
  email: string;
  nickname: string;
}

export function getMyInfo() {
  const token = localStorage.getItem("accessToken");

  return apiClient
    .get("members/me", {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
    .json<{
      isSuccess: boolean;
      code: string;
      message: string;
      result: MyInfoResponse;
    }>()
    .then((response) => response.result);
}
