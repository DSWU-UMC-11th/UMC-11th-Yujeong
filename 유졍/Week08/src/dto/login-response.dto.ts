// src/dto/login-response.dto.ts
// dto 클래스는 자기 자신은 import할 필요가 없음.

export class LoginResponseDto {
  nickname: string;
  accessToken: string;
}
