import type { Metadata } from "next";
import { Noto_Serif_KR, Noto_Sans_KR, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Artlink — 작가와 컬렉터를 잇다",
  description: "작가·미술교육·작품을 잇는 아트 에이전시 Artlink",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${notoSerifKr.variable} ${notoSansKr.variable} ${cormorant.variable} antialiased`}
    >
      <body className="font-[var(--font-sans-kr)]">{children}</body>
    </html>
  );
}
