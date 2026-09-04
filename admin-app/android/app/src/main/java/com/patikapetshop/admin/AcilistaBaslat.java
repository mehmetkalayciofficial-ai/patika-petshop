package com.patikapetshop.admin;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Telefon yeniden başladığında sipariş dinleyicisini tekrar ayağa kaldırır. */
public class AcilistaBaslat extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            SiparisDinleyiciServisi.baslat(context);
        }
    }
}
