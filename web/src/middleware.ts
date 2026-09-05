import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { DEMO_MOD } from "@/lib/demo";

const AUTH_ROTALARI = ["/giris", "/sifremi-unuttum", "/sifre-yenile", "/admin/giris", "/kosullar", "/kvkk"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Supabase anahtarları girilmediyse yönlendirme yapma (demo)
  if (DEMO_MOD) return NextResponse.next();

  const { response, user } = await updateSession(request);

  const authSayfasi = AUTH_ROTALARI.some((r) => pathname === r || pathname.startsWith(r + "/"));

  // Oturum yok → herkes önce giriş/kayıt ekranına düşer (admin kendi ekranına)
  if (!user && !authSayfasi) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.startsWith("/admin") ? "/admin/giris" : "/giris";
    url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  // Oturum var + auth sayfasındaysa → uygun ana ekrana
  if (user && authSayfasi && !["/sifre-yenile", "/kosullar", "/kvkk"].includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/admin/giris" ? "/admin" : "/urunler";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/|manifest.webmanifest|sw.js|indir/|.*\\.(?:png|jpg|jpeg|webp|svg|ico|wav|mp3|apk)$).*)"],
};
