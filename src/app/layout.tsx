import "../app/globals.css";
import { Kanit } from "next/font/google";

const kanit = Kanit({ subsets: ["thai", "latin"], weight: ["400", "700"] });

export const metadata = {
  title: "Diabetes Pregnancy App",
  description: "A beautiful, simple, and clean diabetes-pregnancy-app.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={kanit.className}>{children}</body>
    </html>
  );
}
