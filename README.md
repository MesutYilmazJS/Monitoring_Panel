# 🛡️ Canlı Güvenlik ve Performans Monitörü (SEC-PERF)
👉 **[Demo][https://monitoring-panel-six.vercel.app](https://monitoring-panel-six.vercel.app)**

![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)
![Socket.io](https://img.shields.io/badge/Socket.io-v4.7+_WebSockets-black.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v15+-blue.svg)
![Vanilla JS OOP](https://img.shields.io/badge/Vanilla_JS-ES6+_OOP-yellow.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.0+-38bdf8.svg)
![Vercel & Railway](https://img.shields.io/badge/Live_Deployment-Vercel_%26_Railway-000000.svg)

> **Web uygulamalarında oluşan siber güvenlik tehditlerini (SQLi, IDOR, XSS) ve performans kayıplarını milisaniye hassasiyetinde canlı izleyen, nesne yönelimli (OOP) full-stack telemetry paneli.**
---

## 🌐 Canlı Demo (Live Preview)

 Projeyi canlı ortamda hemen deneyimleyebilirsiniz:
- **Canlı Web Uygulaması (Vercel):** [https://monitoring-panel-six.vercel.app](https://monitoring-panel-six.vercel.app)
- **Arka Yüz & Veritabanı (Railway):** Node.js Express + Socket.io Server & PostgreSQL Database

---

## 💡 Neden Bu Proje? (Portfolyo Tanıtımı)

Bu proje; modern web geliştirme süreçlerinde **nesne yönelimli programlama (OOP) disiplinini**, **gerçek zamanlı (Real-Time WebSockets) olay akışlarını** ve **siber güvenlik farkındalığını** sergilemek amacıyla geliştirilmiştir.

Hiçbir harici ön yüz kütüphanesi (React, Vue vb.) kullanılmadan, tamamen **Vanilla JS ES6+ Sınıf Yapısıyla** kapsüllenmiş (encapsulated) modüler bir mimari kurulmuştur.

---

## 🔥 Öne Çıkan Özellikler & Yetkinlikler

### 1. ⚡ Gerçek Zamanlı Socket.io Mimarisi (Real-Time WebSockets)
- Polling (sayfa yenileyerek istek atma) yerine client ve server arasında sürekli açık tutulan tek bir TCP soket kanalı kullanılır.
- İki farklı tarayıcı sekmesinde veya cihazda açıldığında, bir sekmede tetiklenen güvenlik ihlali veya gecikme **diğer tüm ekranlara canlı olarak yayınlanır (`io.emit`)**.

### 2. 🛡️ Siber Güvenlik Duvarı (Custom Security Middleware)
Gelen tüm HTTP isteklerinin gövde, sorgu ve parametrelerini denetleyen özelleştirilmiş kural motoru:
- **SQL Injection (SQLi):** `UNION SELECT`, `OR 1=1`, `; --` gibi zararlı veri tabanı enjeksiyonlarını tespit edip `403 Forbidden` ile engeller.
- **IDOR / Yetki İhlali:** Yetkisiz kullanıcı ID'si değiştirme ve path traversal (`../`) denemelerini yakalar.
- **Cross-Site Scripting (XSS):** `<script>`, `onerror=`, `onload=` gibi zararlı script enjeksiyonlarını süzerek kaydeder.

### 3. 📈 Canlı Performans & RAM Grafikleri (Chart.js)
- **Ana Latency Grafiği:** HTTP yanıt sürelerini canlı çizer, 300 ms üzerindeki darboğazları (Spikes) kırmızı uyarı rengiyle gösterir.
- **Canlı RAM Telemetri Grafiği:** Sunucunun anlık RAM tüketimini (`MB`) her 3 saniyede bir kayar mini çizgi grafikte gösterir.

### 4. 📄 CSV Raporlama, Filtreleme ve Masaüstü Bildirimleri
- **CSV İndir:** Biriken tüm ihlal loglarını tek tıkla `.csv` raporu olarak indirme.
- **Canlı Log Arama:** IP adresi, Endpoint veya İhlal türüne göre anlık süzme.
- **🔔 Masaüstü Bildirimleri (Web Notification API):** Sekme arka plandayken gelen kritik ihlalleri işletim sistemi bildirimi olarak fırlatma.
- **🖥️ Tam Ekran Odaklanma Modu (Focus Mode):** Grafikleri veya terminali tek tıkla ekranı kaplayacak boyutta inceleme (`ESC` ile çıkış).

---

## 🧪 Canlı Test Senaryoları (İnceleyenler İçin)

Arayüzdeki **Saldırı Simülatörü Konsolu** butonlarına basarak sistemin tepkilerini canlı olarak test edebilirsiniz:

| Test Butonu | Yapılan İşlem | Beklenen Sistem Tepkisi |
| :--- | :--- | :--- |
| **1. SQL Injection Saldırısı** | Zararlı SQL sorgusu gönderir | Güvenlik duvarı isteği **403 Forbidden** ile engeller, terminale kırmızı alarm düşer. |
| **2. IDOR Yetki İhlali** | Yetkisiz kullanıcı ID erişimi dener | Sistem ihlali kaydeder ve terminale `IDOR / Unauthorized Access` uyarısı atar. |
| **3. XSS Saldırısı** | `<script>` etiketi enjekte eder | Kural motoru script'i yakalar, isteği engeller ve log kaydı oluşturur. |
| **4. Performans Gecikmesi** | 2 saniyelik yapay darboğaz tetikler | Canlı çizgi grafikte anında yukarı yönlü bir **Gecikme Sıçraması (Spike)** oluşur. |

---

## 📐 Sistem Mimarisi ve Veri Akışı

```text
  [ İstemci Tarayıcı (Vanilla JS OOP) ] 
                 │
                 ├── (1) REST HTTP İstekleri ────────► [ Express Security Middleware ]
                 │                                                │
                 │                                       (SQLi / IDOR / XSS Kontrolü)
                 │                                                │
                 │                                                ├─► [ PostgreSQL DB ]
                 │                                                │
                 └── (2) Real-time WebSockets ◄───────────────────┴─► [ Socket.io Server ]
```

---

## 🏗️ Temiz Modüler Mimari (Vanilla JS OOP)

- `SocketManager`: WebSocket bağlantı yaşam döngüsü ve dinleyiciler.
- `ChartController`: Chart.js ana latency grafik yönetimi.
- `RamChartController`: Canlı sunucu bellek çizgisi grafik yönetimi.
- `SecurityLogger`: Terminal log akışı, canlı arama, CSV dışa aktarımı ve masaüstü bildirimleri.
- `AttackSimulator`: Simülasyon buton etkileşimleri.
- `App`: Sınıflar arası veri akışını yöneten ana orkestratör.

---

## 🎨 Dinamik Renk Temaları

- 🟠 **Amber & Navy:** Sıcak altın amber ve derin denizci lacivert.
- 🍑 **Midnight & Peach:** Gece indigo fon üzerine sıcak şeftali vurgular.
- 🔵 **Kurumsal Koyu:** Modern SaaS mavi/gri tonları.

---

## 👨‍💻 Geliştirici & İletişim

**Mesut Yılmaz**
- **GitHub:** [MesutYilmazJS](https://github.com/MesutYilmazJS)
- **Proje Deposu:** [Monitoring_Panel](https://github.com/MesutYilmazJS/Monitoring_Panel)

---

## 📜 Lisans

Bu proje [MIT Lisansı](LICENSE) altında açık kaynak olarak sunulmaktadır.
