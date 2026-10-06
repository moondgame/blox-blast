package com.bloxblast.mini;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.window.OnBackInvokedDispatcher;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;

public class MainActivity extends Activity {
    // Game dimuat dari file bawaan aplikasi lewat alamat https lokal ini.
    // Alamat ini tidak pernah keluar ke jaringan: semua permintaannya dijawab dari folder assets.
    private static final String HOST = "appassets.local";
    private static final String START = "https://" + HOST + "/index.html";

    private WebView web;

    private static boolean isApp(Uri u) {
        return "https".equals(u.getScheme()) && HOST.equals(u.getHost());
    }

    // Permintaan data ke Supabase (papan peringkat) diizinkan. Navigasi halaman tetap hanya ke game.
    private static boolean isApi(Uri u) {
        String h = u.getHost();
        return "https".equals(u.getScheme()) && h != null && h.endsWith(".supabase.co");
    }

    private static boolean isInert(Uri u) {
        String s = u.getScheme();
        return "data".equals(s) || "blob".equals(s) || "about".equals(s);
    }

    private static String mime(String path) {
        String p = path.toLowerCase();
        if (p.endsWith(".html")) return "text/html";
        if (p.endsWith(".js")) return "text/javascript";
        if (p.endsWith(".css")) return "text/css";
        if (p.endsWith(".json")) return "application/json";
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".svg")) return "image/svg+xml";
        return "application/octet-stream";
    }

    private WebResourceResponse reply(int code, String reason) {
        return new WebResourceResponse("text/plain", "utf-8", code, reason,
                new HashMap<String, String>(), new ByteArrayInputStream(new byte[0]));
    }

    private WebResourceResponse asset(Uri u) {
        String path = u.getPath();
        if (path == null || path.isEmpty() || path.equals("/")) path = "/index.html";
        path = path.substring(1);
        if (path.contains("..") || path.contains("\\")) return reply(404, "Not Found");
        try {
            InputStream in = getAssets().open(path);
            String m = mime(path);
            return new WebResourceResponse(m, m.startsWith("text/") || m.endsWith("json") ? "utf-8" : null, in);
        } catch (IOException e) {
            return reply(404, "Not Found");
        }
    }

    // Satu-satunya jembatan JS: hanya mengirim teks ke menu Bagikan Android.
    // Aman karena WebView hanya memuat game bawaan aplikasi.
    private class ShareBridge {
        @JavascriptInterface
        public void share(String text) {
            if (text == null) return;
            final String t = text.length() > 600 ? text.substring(0, 600) : text;
            runOnUiThread(() -> {
                Intent i = new Intent(Intent.ACTION_SEND);
                i.setType("text/plain");
                i.putExtra(Intent.EXTRA_TEXT, t);
                startActivity(Intent.createChooser(i, "Bagikan hasil"));
            });
        }
    }

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        WebView.setWebContentsDebuggingEnabled(false);
        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#14213d"));
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setAllowFileAccessFromFileURLs(false);
        s.setAllowUniversalAccessFromFileURLs(false);
        s.setGeolocationEnabled(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                return !(isApp(u) || isInert(u));
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                if (isApp(u)) return asset(u);
                if (isApi(u) || isInert(u)) return null;
                return reply(403, "Blocked");
            }
        });
        web.addJavascriptInterface(new ShareBridge(), "AndroidShare");

        // Android 15+ menggambar aplikasi sampai ke tepi layar: beri jarak agar game tidak tertutup bar sistem.
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#14213d"));
        root.addView(web, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            int l, t, r, b;
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets i = insets.getInsets(
                        WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                l = i.left; t = i.top; r = i.right; b = i.bottom;
            } else {
                l = insets.getSystemWindowInsetLeft();
                t = insets.getSystemWindowInsetTop();
                r = insets.getSystemWindowInsetRight();
                b = insets.getSystemWindowInsetBottom();
            }
            v.setPadding(l, t, r, b);
            return WindowInsets.CONSUMED;
        });
        setContentView(root);

        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController c = getWindow().getInsetsController();
            if (c != null) {
                // Latar gelap: ikon status bar dan navigasi dibuat terang
                c.setSystemBarsAppearance(0, WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
                        | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS);
            }
        }
        // Tombol kembali versi baru (wajib di Android 16 untuk aplikasi target API 36)
        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::handleBack);
        }

        if (state == null) {
            web.loadUrl(START);
        } else {
            web.restoreState(state);
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onPause() {
        super.onPause();
        web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            web.stopLoading();
            web.destroy();
        }
        super.onDestroy();
    }

    // Tombol kembali: halaman lain (misalnya kebijakan privasi) -> kembali; dari game ke Beranda; dari Beranda keluar
    private void handleBack() {
        if (web.canGoBack()) {
            web.goBack();
            return;
        }
        web.evaluateJavascript(
            "(function(){var h=document.getElementById('home');if(h&&h.hidden){showHome();return 1}return 0})()",
            value -> { if (!"1".equals(value)) finish(); });
    }

    // Android 12 ke bawah (dan jika callback baru tidak dipakai)
    @Override
    public void onBackPressed() {
        handleBack();
    }
}
