import { serveUpload } from "@/lib/serve-upload";

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  return serveUpload("artwork-uploads", segments);
}
