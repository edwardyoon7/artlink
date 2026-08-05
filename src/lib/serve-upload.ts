import { readFile, stat } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

// 작품/굿즈/프로필 이미지 등 런타임 업로드 파일을 위한 공용 서빙 로직.
//
// 왜 필요한가: 이 Next.js 버전은 서버가 뜬 시점에 public/ 폴더 목록을 스냅샷으로 고정해두고
// 이후 요청은 그 목록만 확인한다(node_modules/next/dist/server/lib/router-utils/filesystem.js의
// setupFsCheck). 즉 서버 부팅 이후 public/ 안에 새로 생긴 파일은 재시작 전까지 전부 404가 난다.
// 그래서 업로드 파일은 public/ 밖(runtime-uploads/)에 저장하고, 이 Route Handler로 매 요청마다
// 디스크에서 직접 읽어 응답한다 — Route Handler는 일반 API처럼 매 요청 시 실행되므로 스냅샷
// 문제와 무관하게 항상 최신 파일을 반영한다(자세한 배경은 CLAUDE.md 참고).
const UPLOAD_ROOT = path.join(process.cwd(), "runtime-uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
};

export async function serveUpload(folder: string, segments: string[]) {
  // 경로 조작(path traversal) 방지 — ".."이 포함된 세그먼트는 거부
  if (segments.some((segment) => segment.includes("..") || segment.includes("/") || segment.includes("\\"))) {
    return NextResponse.json({ error: "잘못된 경로입니다." }, { status: 400 });
  }

  const filePath = path.join(UPLOAD_ROOT, folder, ...segments);

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
    }
    const buffer = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
  }
}
