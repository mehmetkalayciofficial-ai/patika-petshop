package com.patikapetshop.admin;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = getBridge().getWebView();
        WebSettings ayar = webView.getSettings();
        ayar.setDomStorageEnabled(true);
        ayar.setDatabaseEnabled(true);
        ayar.setMediaPlaybackRequiresUserGesture(false); // "ding" sesi kullanıcı dokunmadan çalabilsin
        ayar.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Uygulama arka plandayken de canlı bağlantı kopmasın
        SiparisDinleyiciServisi.baslat(this);
    }

    @Override
    public void onPause() {
        super.onPause();
        // WebView zamanlayıcıları arka planda da çalışsın (Supabase realtime canlı kalsın)
        getBridge().getWebView().resumeTimers();
    }
}
