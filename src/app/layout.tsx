import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export const metadata: Metadata = {
  title: "Trace",
  description: "Trace enterprise document tracking"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex flex-1 flex-col">
            <TopBar />
            <main className="flex-1 bg-white">
              <div className="container-shell py-8">{children}</div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
