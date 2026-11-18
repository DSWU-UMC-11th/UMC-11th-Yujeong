import { apiClient } from "../api-client";

export interface CheckNicknameDuplicateResponse {
  isAvailable: boolean;
}

export function checkNicknameDuplicate(nickname: string) {
  return apiClient
    .get(`members/nickname/${encodeURIComponent(nickname)}`)
    .json<CheckNicknameDuplicateResponse>();
}
