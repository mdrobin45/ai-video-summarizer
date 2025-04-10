import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const geistSans = Roboto({
   variable: "--font-roboto-sans",
   subsets: ["latin"],
});

export const metadata: Metadata = {
   title: "Youtube Summarizer",
   description: "Take notes from youtube videos",
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="en">
         <body className={`${geistSans.variable}`}>{children}</body>
      </html>
   );
}
