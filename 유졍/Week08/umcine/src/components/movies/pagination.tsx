interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

// 한 번에 보여 줄 페이지 번호 개수
const VISIBLE_COUNT = 5;

// ‹ 1 2 3 › 형태의 페이지 이동 버튼
export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages < 1) return null;

  // 현재 페이지가 가운데쯤 오도록 보여 줄 번호 범위를 계산해요.
  const half = Math.floor(VISIBLE_COUNT / 2);
  const start = Math.max(
    1,
    Math.min(page - half, totalPages - VISIBLE_COUNT + 1),
  );
  const end = Math.min(totalPages, start + VISIBLE_COUNT - 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav aria-label="페이지" className="mt-10 flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="이전 페이지"
        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-200 disabled:text-gray-300 disabled:hover:bg-transparent"
      >
        ‹
      </button>

      {pages.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          aria-current={value === page ? "page" : undefined}
          className={
            value === page
              ? "h-8 min-w-8 rounded-md bg-gray-900 px-2 text-sm font-semibold text-white"
              : "h-8 min-w-8 rounded-md px-2 text-sm text-gray-600 hover:bg-gray-200"
          }
        >
          {value}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="다음 페이지"
        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-200 disabled:text-gray-300 disabled:hover:bg-transparent"
      >
        ›
      </button>
    </nav>
  );
}
