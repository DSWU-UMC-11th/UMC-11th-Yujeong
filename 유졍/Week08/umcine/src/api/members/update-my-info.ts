import { apiClient } from "../api-client";

export interface UpdateMyInfoRequest {
  nickname: string;
}

export function updateMyInfo(data: UpdateMyInfoRequest) {
  return apiClient.patch("members", { json: data }).json();
}
