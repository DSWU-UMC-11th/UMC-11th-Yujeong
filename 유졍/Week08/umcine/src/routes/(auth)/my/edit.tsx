import { createFileRoute } from "@tanstack/react-router";
import { EditMyInfoPage } from "@/pages/my/edit-my-info-page";

// 주소: /my/edit
export const Route = createFileRoute("/(auth)/my/edit")({
  component: EditMyInfoPage,
});
