import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/sidebar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shops Admin",
  description: "Multi-store dropshipping admin dashboard",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // If not logged in and not on login page, allow through
  // (login page handles its own layout)

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {session?.user ? (
            <div className="flex h-screen">
              <Sidebar />
              <main className="flex-1 overflow-auto">
                <div className="p-8">{children}</div>
              </main>
            </div>
          ) : (
            children
          )}
        </Providers>
      </body>
    </html>
  );
}
