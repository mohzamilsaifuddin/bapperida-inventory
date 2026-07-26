import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = token.role;

    // Admin can access everything
    if (role === "ADMIN") {
      return NextResponse.next();
    }

    // Role-based protection rules
    if (pathname.startsWith("/master-data") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    
    if (pathname.startsWith("/transaksi") && role === "PIMPINAN") {
       // Pimpinan shouldn't input transactions? Well PRD says Pimpinan hak akses: Dashboard, Monitoring, Laporan, Prediksi.
       return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/master-data/:path*",
    "/transaksi/:path*",
    "/monitoring/:path*",
    "/prediksi/:path*",
    "/laporan/:path*"
  ],
};
