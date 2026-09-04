import type { Metadata } from "next";
import { YasalSayfa } from "@/components/YasalSayfa";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "KVKK Aydınlatma Metni" };

export default function Page() {
  return (
    <YasalSayfa baslik="KVKK Aydınlatma Metni">
      <h2>Veri sorumlusu</h2>
      <p>
        Kişisel verilerin, {SITE.ad} tarafından 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu
        sıfatıyla işlenir.
      </p>

      <h2>İşlenen veriler</h2>
      <ul>
        <li>Ad soyad, telefon numarası, e-posta adresi</li>
        <li>Teslimat adresi bilgileri</li>
        <li>Sipariş geçmişi ve sipariş notları</li>
      </ul>

      <h2>İşleme amacı</h2>
      <ul>
        <li>Siparişini almak, hazırlamak ve teslim etmek</li>
        <li>Sipariş durumu hakkında seni bilgilendirmek</li>
        <li>Yasal yükümlülükleri yerine getirmek</li>
      </ul>

      <h2>Aktarım</h2>
      <p>
        Verilerin, siparişin teslim edilebilmesi için yalnızca gerekli olduğu ölçüde kurye ile paylaşılır. Bunun dışında
        üçüncü kişilerle paylaşılmaz, pazarlama amacıyla satılmaz.
      </p>

      <h2>Saklama süresi</h2>
      <p>Verilerin, hesabın açık olduğu sürece ve yasal saklama süreleri boyunca tutulur.</p>

      <h2>Haklarını kullanma</h2>
      <p>
        Kanunun 11. maddesi kapsamında verilerine erişme, düzeltme, silme ve işlemeye itiraz etme haklarına sahipsin.
        Hesabını uygulama içinden “Hesabımı Sil” ile kapatabilir ya da mağazayla iletişime geçebilirsin.
      </p>
    </YasalSayfa>
  );
}
