import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
// [변경] 예전 getMyInfo는 localStorage의 "accessToken" 키를 읽는데,
// 지금 토큰은 auth-store("umcine-auth-store")에 저장돼서 토큰 없이 요청이 나가요(401).
// 그래서 authApi를 쓰는 getMe + 내 정보 query로 바꿨어요.
import { getMe } from "@/api/members/me";
// [추가] 회원가입에서 쓰던 닉네임 중복 확인 API를 그대로 재사용해요. (GET /members/nickname/{nickname})
import { checkNicknameDuplicate } from "@/api/members/check-nickname-duplicate";
import { PencilIcon, PersonIcon } from "@/components/common/icons";
// [변경] updateMyInfo API를 직접 부르지 않고 내 정보 수정 mutation 훅을 사용해요.
import { useUpdateMeMutation } from "@/hooks/use-update-me-mutation";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function EditMyInfoPage() {
  // [변경] userInfo, email, isLoading 상태 대신 내 정보 query를 써요.
  const meQuery = useQuery({
    queryKey: ["members", "me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const userInfo = meQuery.data;

  // 닉네임은 사용자가 고치는 입력값이라 따로 useState로 관리해요.
  const [nickname, setNickname] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  // [변경] isUpdating 상태를 제거했어요. 요청 중 여부는 updateMeMutation.isPending으로 확인해요.
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  // [추가] 중복 확인 요청 중인지 (버튼 중복 클릭 방지)
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // [추가] 내 정보 수정 mutation
  // 성공하면 훅이 ["members", "me"] 캐시를 응답 값으로 바로 바꿔요(setQueryData).
  const updateMeMutation = useUpdateMeMutation();

  // [추가] 교안의 form.nickname 대신, 이 컴포넌트는 nickname 상태를 쓰므로 nickname.trim()을 사용해요.
  // 상태 이름(nickname)과 겹치지 않게 trimmedNickname으로 이름 붙였어요.
  const trimmedNickname = nickname.trim();
  // [추가] 닉네임이 2~12자일 때만 저장할 수 있어요.
  const canSubmit = trimmedNickname.length >= 2 && trimmedNickname.length <= 12;

  // [변경] 내 정보를 받아오면 닉네임 입력칸의 처음 값으로 채워요.
  // 서버 값(userInfo)과 입력 중인 값(nickname)은 원본이 다르므로 따로 둬요.
  useEffect(() => {
    if (userInfo) {
      setNickname(userInfo.nickname ?? "");
    }
  }, [userInfo]);

  // 프로필 이미지 선택 (이미지 파일, 5MB 이하만 허용)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 선택할 수 있습니다.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert("프로필 이미지는 최대 5MB까지 가능합니다.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setProfileImage(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  // [변경] 닉네임 중복 확인: API를 연결했어요.
  const handleNicknameCheck = async () => {
    // 저장 조건과 같은 규칙(2~12자)을 먼저 확인해요.
    if (!canSubmit) {
      alert("닉네임은 2~12자로 입력해 주세요.");
      return;
    }
    if (isCheckingNickname) return;

    // 지금 쓰고 있는 내 닉네임이면 서버에 물어볼 필요가 없어요.
    // (서버에 물어보면 "나"를 다른 사람으로 보고 사용 불가라고 답해요.)
    if (trimmedNickname === userInfo?.nickname) {
      setIsNicknameChecked(true);
      alert("현재 사용 중인 닉네임입니다.");
      return;
    }

    setIsCheckingNickname(true);
    try {
      const { isAvailable } = await checkNicknameDuplicate(trimmedNickname);
      setIsNicknameChecked(isAvailable);
      alert(
        isAvailable
          ? "사용할 수 있는 닉네임이에요."
          : "이미 사용 중인 닉네임이에요.",
      );
    } catch {
      setIsNicknameChecked(false);
      alert("중복 확인에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setIsCheckingNickname(false);
    }
  };

  // [변경] 기존 handleUpdate를 교안의 handleSubmit으로 교체했어요.
  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    // 브라우저 기본 동작(페이지 새로고침)을 막아요.
    event.preventDefault();
    // 닉네임 조건을 못 채웠거나 이미 저장 중이면 중복 제출을 막아요.
    if (!canSubmit || updateMeMutation.isPending) return;

    // mutation 실행: 성공 시 캐시 갱신과 알림은 useUpdateMeMutation이 담당해요.
    updateMeMutation.mutate({ nickname: trimmedNickname });
  };

  // 회원 탈퇴 (API는 아직 연결 전)
  const handleWithdraw = () => {
    const confirmed = window.confirm(
      "정말 회원 탈퇴하시겠습니까?\n작성한 평점, 후기와 즐겨찾기가 모두 삭제되며 복구할 수 없습니다.",
    );

    if (!confirmed) return;

    // 회원 탈퇴 API 연결 필요
    alert("회원 탈퇴 API가 아직 연결되지 않았습니다.");
  };

  if (meQuery.isLoading) {
    return (
      <main className="mx-auto w-full max-w-[1200px] px-6 py-10">
        <p className="py-20 text-center text-gray-500">내 정보를 불러오는 중...</p>
      </main>
    );
  }

  return (
    // [변경] 디자인에 맞춰 레이아웃을 바꿨어요.
    // flex-1 + flex-col로 화면 높이를 채우고, 회원 탈퇴 영역은 mt-auto로 맨 아래에 붙여요.
    <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-6 py-10">
      {/* 저장 버튼과 입력 영역을 form으로 감싸서 Enter로도 저장할 수 있어요. */}
      {/* mb-16: 화면이 낮아도 회원 탈퇴 영역과 최소 간격을 둬요. */}
      <form onSubmit={handleSubmit} className="mb-16">
        {/* 제목 + 저장 버튼 */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">내 정보 수정</h1>
            <p className="mt-2 text-sm text-gray-500">
              닉네임과 프로필 이미지만 변경할 수 있어요.
            </p>
          </div>

          <button
            type="submit"
            disabled={!canSubmit || updateMeMutation.isPending}
            className="shrink-0 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {updateMeMutation.isPending ? "저장 중" : "변경사항 저장"}
          </button>
        </div>

        {/* 왼쪽: 프로필 이미지 / 오른쪽: 입력칸 */}
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          {/* 프로필 이미지 */}
          <div className="flex flex-col items-center pt-4">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-gray-800">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="선택한 프로필 이미지"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <PersonIcon className="h-9 w-9" />
                )}
              </div>

              {/* form 안의 버튼은 type="button"이어야 눌러도 제출되지 않아요. */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="프로필 이미지 수정"
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-900 bg-white text-gray-900 transition hover:bg-gray-100"
              >
                <PencilIcon className="h-3.5 w-3.5" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            <p className="mt-3 text-sm font-semibold text-gray-900">프로필 이미지</p>
            <p className="mt-0.5 text-xs text-gray-400">선택 사항 · 최대 5MB</p>
          </div>

          {/* 입력 영역 */}
          <div className="flex flex-col gap-5">
            {/* 닉네임: 중복 확인 버튼을 입력칸 안쪽 오른쪽에 붙여요. */}
            <div>
              <label htmlFor="nickname" className="mb-2 block text-sm font-semibold text-gray-900">
                닉네임
              </label>
              <div className="flex items-center rounded-lg border border-gray-200 bg-white pr-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setIsNicknameChecked(false);
                  }}
                  placeholder="닉네임을 입력해 주세요."
                  maxLength={12}
                  className="min-w-0 flex-1 rounded-lg bg-transparent px-4 py-3 text-sm text-gray-900 outline-none"
                />
                <button
                  type="button"
                  onClick={handleNicknameCheck}
                  disabled={isCheckingNickname}
                  className="shrink-0 text-xs font-semibold text-blue-600 hover:underline disabled:opacity-50"
                >
                  {isCheckingNickname ? "확인 중" : "중복 확인"}
                </button>
              </div>
              {isNicknameChecked && (
                <p className="mt-2 text-xs text-green-600">닉네임 확인 완료</p>
              )}
            </div>

            {/* 이메일 (읽기 전용) */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-900">
                이메일
              </label>
              <input
                id="email"
                value={userInfo?.email ?? ""}
                readOnly
                aria-describedby="email-help"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none"
              />
              <p id="email-help" className="sr-only">
                이메일은 변경할 수 없습니다.
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* 회원 탈퇴: 저장 form과 상관없으므로 form 밖에 두고, mt-auto로 맨 아래에 붙여요. */}
      <section className="mt-auto flex items-center justify-between gap-4 rounded-lg border border-red-300 bg-red-50 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-red-600">회원 탈퇴</h2>
          <p className="mt-1 text-xs text-red-500">
            탈퇴하면 작성한 평점, 후기와 즐겨찾기가 모두 삭제되며 복구할 수 없습니다.
          </p>
        </div>
        <button
          type="button"
          onClick={handleWithdraw}
          className="shrink-0 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
        >
          회원 탈퇴
        </button>
      </section>
    </main>
  );
}
