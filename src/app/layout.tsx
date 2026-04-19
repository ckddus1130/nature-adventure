import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  title: "몽이의 자연탐험기",
  description: "몽이의 자연탐험기는 자연과 함께 수학의 비밀을 알아가는 과정입니다. 몽이와 함께 숲속을 탐험하며 자연의 비밀을 탐험해보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko">
      <body className="m-0 bg-green-400">{children}</body>
    </html>
  );
}
