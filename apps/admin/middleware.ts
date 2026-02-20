export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - /login
     * - /api/auth/* (NextAuth routes)
     * - /_next/static, /_next/image (Next.js internals)
     * - /favicon.ico, /sitemap.xml, /robots.txt (static files)
     */
    "/((?!login|api/auth|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)",
  ],
};
