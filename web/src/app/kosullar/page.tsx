import type { Metadata } from "next";
import { YasalSayfa } from "@/components/YasalSayfa";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Kullanım Koşulları" };

export default function Page() {
  return (
    <YasalSayfa baslik="Kullanım Koşulları">
      <h2>1. Genel</h2>
      <p>
        Bu koşullar, {SITE.ad} online sipariş sitesinin kullanımını düzenler. Siteye üye olarak ya da sipariş vererek bu
        koşulları kabul etmiş olursun.
      </p>

      <h2>2. Üyelik</h2>
      <p>
        Sipariş verebilmek için üye olman gerekir. Verdiğin bilgilerin doğru ve güncel olmasından sen sorumlusun. Hesabının
        şifresini kimseyle paylaşma.
      </p>

      <h2>3. Sipariş ve teslimat</h2>
      <ul>
        <li>Ürün fiyatları ve stok bilgileri sitede güncel olarak gösterilir.</li>
        <li>Sipariş, mağaza tarafından onaylandıktan sonra hazırlanır.</li>
        <li>Ödeme kapıda nakit ya da kapıda kredi kartı ile yapılır; sitede online ödeme alınmaz.</li>
        <li>Stok sorunu ya da başka bir engel durumunda mağaza siparişi iptal edebilir; iptal sebebi sana bildirilir.</li>
      </ul>

      <h2>4. İptal ve iade</h2>
      <p>
        Siparişini teslim almadan önce mağazayı arayarak iptal edebilirsin. Ambalajı açılmamış ürünlerde iade talepleri için
        mağaza ile iletişime geç.
      </p>

      <h2>5. Sorumluluk</h2>
      <p>
        Ürünler evcil hayvan bakım ürünleridir; kullanım talimatlarına uymak kullanıcının sorumluluğundadır. Sağlıkla ilgili
        durumlarda veterinerine danış.
      </p>

      <h2>6. Değişiklikler</h2>
      <p>Bu koşullar zaman zaman güncellenebilir. Güncel sürüm her zaman bu sayfada yayınlanır.</p>
    </YasalSayfa>
  );
}
