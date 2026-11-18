import { createFileRoute } from "@tanstack/react-router";
import { MyInfoPage } from "@/pages/my/my-info-page";

// 주소: /my  (Route Group 폴더 이름 "(auth)"는 주소에 포함되지 않아요)
export const Route = createFileRoute("/(auth)/my/")({
  component: MyInfoPage,
});
