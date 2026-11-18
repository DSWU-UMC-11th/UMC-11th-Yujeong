# UMCine 11주차 — Zustand 북마크

## 필수 미션 완료 사항

- [x] `zustand` 설치 여부 확인 (`package.json`: `zustand@^5.0.15`)
- [x] `src/stores/bookmark-store.ts`에 전역 북마크 store와 `toggleBookmark` action 구현
- [x] `src/components/bookmark-button.tsx`에 재사용 가능한 북마크 버튼 구현
- [x] 영화 목록, 검색 결과, 상세 화면에 같은 북마크 버튼 연결
- [x] `persist`와 `createJSONStorage`로 `umcine-bookmark-store`를 `localStorage`에 저장
- [x] 화면 전환과 새로고침 후에도 북마크 상태가 유지되는 구조 적용
- [x] `umcine-bookmark-store` 저장값이 없거나 잘못된 경우 빈 배열로 안전하게 시작하도록 처리
- [x] `pnpm lint`, `pnpm build` 통과

핵심 상태는 영화 전체 객체가 아니라 북마크한 영화의 ID 배열입니다.

```ts
interface BookmarkStore {
  bookmarkedMovieIds: number[];
  toggleBookmark: (movieId: number) => void;
}
```

영화 정보 자체는 서버 데이터가 될 수 있지만, 이번 미션에서 북마크 여부는 브라우저가 기준인 클라이언트 상태입니다. 따라서 영화 데이터를 Zustand에 복사하지 않고 ID만 저장합니다.

## 구현 흐름

1. 화면이 `useBookmarkStore(selector)`로 필요한 상태 또는 action을 구독합니다.
2. 버튼을 누르면 `toggleBookmark(movieId)`가 실행됩니다.
3. ID가 이미 있으면 `filter`로 제거하고, 없으면 새 배열 끝에 추가합니다.
4. Zustand가 구독 중인 컴포넌트를 다시 렌더링합니다.
5. `persist` middleware가 변경된 ID 배열을 JSON으로 변환하여 `localStorage`에 저장합니다.
6. 앱을 새로 열면 `persist`가 저장값을 읽어 store를 복원합니다.

## 개념 정리

### 1. 로컬 상태와 전역 상태

로컬 상태는 한 컴포넌트 또는 가까운 하위 컴포넌트만 사용하는 값입니다. 검색 입력값, 모달 열림 여부처럼 사용 범위가 좁으면 `useState`가 적합합니다.

전역 상태는 서로 떨어진 여러 화면에서 함께 읽고 변경하는 값입니다. 북마크 ID는 목록·검색·상세 화면이 모두 사용하므로 Zustand store에 두었습니다. 전역 store에 모든 값을 넣는 것이 목표는 아닙니다.

### 2. 클라이언트 상태와 서버 상태

클라이언트 상태는 브라우저 UI가 기준인 값입니다. 이번 북마크, 입력값, 테마 등이 여기에 해당합니다.

서버 상태는 API나 데이터베이스가 원본인 값입니다. 영화 정보나 서버에 저장된 사용자 정보가 예입니다. 서버 상태를 Zustand에 다시 복사하면 원본이 둘이 되어 최신 값을 판단하기 어려울 수 있습니다. 이후 서버 데이터는 TanStack Query 같은 서버 상태 도구로 관리하고, Zustand에는 필요한 클라이언트 상태만 둡니다.

### 3. `localStorage`와 `sessionStorage`

두 저장소 모두 같은 origin(protocol + host + port) 안에서 문자열 key/value를 저장합니다.

- `localStorage`: 브라우저를 닫았다 열어도 값이 남습니다. 북마크처럼 계속 유지할 값에 적합합니다.
- `sessionStorage`: 현재 탭의 세션 동안만 유지되고 탭을 닫으면 사라집니다.

둘 다 동기 API이므로 큰 데이터를 자주 저장하면 화면을 막을 수 있습니다. 또한 사용자가 개발자 도구에서 수정하거나 삭제할 수 있으므로 저장값을 신뢰하면 안 됩니다. 비밀번호, 인증 토큰, 민감한 개인정보도 이 예제 방식으로 저장하지 않습니다.

### 4. `JSON.stringify`와 `JSON.parse`

Web Storage는 문자열만 저장합니다. 배열이나 객체는 저장 전에 JSON 문자열로 바꾸고, 읽을 때 다시 JavaScript 값으로 복원해야 합니다.

```ts
const ids = [1, 2];
localStorage.setItem("umcine-bookmarks", JSON.stringify(ids));

const saved = localStorage.getItem("umcine-bookmarks");
const restored = saved ? JSON.parse(saved) : [];
```

`JSON.parse`는 잘못된 문자열에서 예외를 던질 수 있습니다. 이 프로젝트의 `normalizeBookmarkIds`와 `readBookmarkIds`는 배열 여부, 정수 여부, 중복을 확인하고 문제가 있으면 빈 배열을 사용합니다.

### 5. Zustand의 store, action, selector

- store: 여러 컴포넌트가 공유하는 상태와 상태 변경 함수를 담는 공간입니다.
- action: 상태를 변경하는 함수입니다. 여기서는 `toggleBookmark`입니다.
- selector: 컴포넌트가 store에서 필요한 일부만 고르는 함수입니다.

```ts
const isBookmarked = useBookmarkStore((state) =>
  state.bookmarkedMovieIds.includes(movieId),
);
const toggleBookmark = useBookmarkStore((state) => state.toggleBookmark);
```

컴포넌트가 store 전체가 아니라 필요한 값만 선택하면 관련 없는 상태 변경으로 인한 렌더링을 줄일 수 있습니다.

### 6. `persist` middleware

Zustand 상태는 기본적으로 메모리에 있으므로 새로고침하면 사라집니다. `persist`는 상태가 바뀔 때 저장하고 앱이 시작될 때 복원하는 middleware입니다.

`createJSONStorage(() => localStorage)`는 Zustand 상태를 JSON 형태로 직렬화·역직렬화하는 저장소 adapter를 만듭니다. `partialize`로 action을 제외하고 `bookmarkedMovieIds`만 저장했습니다.

### 7. Web Storage와 Zustand의 역할 차이

Web Storage는 문자열을 오래 보관하는 브라우저 저장 공간입니다. 값이 바뀌어도 React 컴포넌트를 자동으로 다시 렌더링하지 않습니다.

Zustand는 실행 중인 앱의 상태를 관리하고, selector로 구독 중인 React 컴포넌트를 다시 렌더링합니다. 하지만 `persist`가 없으면 새로고침 후 상태는 사라집니다.

따라서 이번 구현에서는 Zustand가 앱 실행 중의 공유와 업데이트를 담당하고, `localStorage`가 새로고침 이후의 보관을 담당합니다. `persist`가 두 역할을 연결합니다.

## 직접 확인 방법

1. `pnpm dev`로 앱을 실행합니다.
2. 목록에서 영화 하나를 북마크합니다.
3. 검색 또는 상세 화면으로 이동해 같은 영화의 버튼이 `북마크 해제`인지 확인합니다.
4. 페이지를 새로고침해 상태가 유지되는지 확인합니다.
5. 개발자 도구의 Application → Local storage에서 `umcine-bookmark-store`를 확인합니다.
6. 해당 key만 삭제한 뒤 새로고침하여 모든 버튼이 `북마크 추가`로 돌아오는지 확인합니다. `localStorage.clear()`는 다른 기능의 값도 지우므로 사용하지 않습니다.

## 명령어

```bash
pnpm dev
pnpm lint
pnpm build
```
