import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const AUTH_ROTALARI = ["/giris", "/sifremi-unuttum", "/sifre-yenile"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user } = await updateSession(request);

  const authSayfasi = AUTH_ROTALARI.some((r) => pathname === r || pathname.startsWith(r + "/"));

  // Oturum yok → herkes önce giriş/kayıt ekranına düşer
  if (!user && !authSayfasi) {
    const url = request.nextUrl.clone();
    url.pathname = "/giris";
    url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  // Oturum var + auth sayfasındaysa → ürünlere
  if (user && authSayfasi && pathname !== "/sifre-yenile") {
    const url = request.nextUrl.clone();
    url.pathname = "/urunler";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/|manifest.webmanifest|sw.js|.*\\.(?:png|jpg|jpeg|webp|svg|ico|wav|mp3)$).*)"],
};
