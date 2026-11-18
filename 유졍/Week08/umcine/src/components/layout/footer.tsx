// 사이트 하단 TMDB 출처 표기
// TMDB API를 쓰는 서비스는 이 문구로 출처를 밝혀야 해요.
export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-[1200px] items-center justify-end gap-2 px-6 py-5 text-xs text-gray-500">
        <span className="rounded bg-gradient-to-r from-[#90cea1] to-[#01b4e4] px-1.5 py-0.5 text-[10px] font-bold text-[#0d253f]">
          TMDB
        </span>
        <p>
          This product uses the TMDB API but is not endorsed or certified by{" "}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            TMDB
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
