package com.patikapetshop.admin;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

/**
 * Uygulama arka plandayken de Supabase canlı bağlantısının kopmaması için
 * çalışan ön plan servisi. Kalıcı (sessiz, düşük öncelikli) bir bildirim gösterir;
 * bu sayede Android uygulama sürecini öldürmez ve yeni sipariş geldiği anda
 * "ding" sesli bildirim düşebilir.
 */
public class SiparisDinleyiciServisi extends Service {

    private static final String KANAL = "servis";
    private static final int BILDIRIM_ID = 4201;
    private PowerManager.WakeLock kilit;

    public static void baslat(Context ctx) {
        Intent i = new Intent(ctx, SiparisDinleyiciServisi.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) ctx.startForegroundService(i);
        else ctx.startService(i);
    }

    @Override
    public void onCreate() {
        super.onCreate();
        kanalOlustur();

        Intent ac = new Intent(this, MainActivity.class);
        ac.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        int bayrak = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) bayrak |= PendingIntent.FLAG_IMMUTABLE;
        PendingIntent pi = PendingIntent.getActivity(this, 0, ac, bayrak);

        Notification.Builder b = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? new Notification.Builder(this, KANAL)
                : new Notification.Builder(this);

        Notification bildirim = b
                .setContentTitle("Patika Admin açık")
                .setContentText("Yeni siparişler için bekleniyor")
                .setSmallIcon(R.drawable.ic_stat_paw)
                .setContentIntent(pi)
                .setOngoing(true)
                .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(BILDIRIM_ID, bildirim, android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC);
        } else {
            startForeground(BILDIRIM_ID, bildirim);
        }

        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        if (pm != null) {
            kilit = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "patika:siparis");
            kilit.setReferenceCounted(false);
            kilit.acquire();
        }
    }

    private void kanalOlustur() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null || nm.getNotificationChannel(KANAL) != null) return;

        NotificationChannel kanal = new NotificationChannel(KANAL, "Uygulama durumu", NotificationManager.IMPORTANCE_MIN);
        kanal.setDescription("Uygulamanın açık kaldığını gösteren sessiz bildirim");
        kanal.setShowBadge(false);
        kanal.setSound(null, null);
        nm.createNotificationChannel(kanal);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        if (kilit != null && kilit.isHeld()) kilit.release();
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
