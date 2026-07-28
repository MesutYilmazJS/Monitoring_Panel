# 🛡️ Canlı Güvenlik ve Performans Monitörü (SEC-PERF)

![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)
![Socket.io](https://img.shields.io/badge/Socket.io-v4.7+-black.svg)
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

Bu proje; modern web geliştirme süreçlerinde **nesne yönelimli programlama (OOP) disiplinini**, **gerçek zamanlı (Real-Time) olay akışlarını** ve **siber güvenlik farkındalığını** sergilemek amacıyla geliştirilmiştir.

Hiçbir harici ön yüz mimari kütüphanesi (React, Vue vb.) kullanılmadan, tamamen **Vanilla JS ES6+ Sınıf Yapısıyla** kapsüllenmiş (encapsulated) modüler bir mimari kurulmuştur.

---

## 🔥 Projede Sergilenen Yetkinlikler

### 1. 🛡️ Siber Güvenlik Duvarı (Custom Security Middleware)
Gelen tüm HTTP isteklerinin gövde, sorgu ve parametrelerini denetleyen özelleştirilmiş kural motoru:
- **SQL Injection (SQLi):** `UNION SELECT`, `OR 1=1`, `; --` gibi zararlı veri tabanı enjeksiyonlarını tespit edip `403 Forbidden` ile engeller.
- **IDOR / Yetki İhlali:** Yetkisiz kullanıcı ID'si değiştirme ve path traversal (`../`) denemelerini yakalar.
- **Cross-Site Scripting (XSS):** `<script>`, `onerror=`, `onload=` gibi zararlı kod çalıştırma girişimlerini süzerek kaydeder.

### 2. ⚡ Gerçek Zamanlı Performans Akışı (WebSockets & Socket.io)
- İstek yanıt sürelerini milisaniye cinsinden hesaplar.
- Sunucu ve veritabanı üzerindeki yükü **Socket.io** üzerinden canlı olarak ön yüze aktarır.
- Chart.js ile 300 ms üzerindeki performans darboğazlarını (Spikes) kırmızı renk uyarısıyla canlı çizer.

### 3. 🏗️ Temiz Modüler Mimarisi (Vanilla JS OOP)
Kod spagettiye dönüşmeden, her biri tek bir sorumluluğu üstlenen (Single Responsibility Principle) sınıflara ayrılmıştır:
- `SocketManager`: WebSocket bağlantı yaşam döngüsü.
- `ChartController`: Chart.js grafik yönetimi ve tema renk uyarlaması.
- `SecurityLogger`: Live terminal feed, canlı arama ve CSV rapor indirme.
- `AttackSimulator`: Canlı test buton etkileşimleri.
- `App`: Sınıflar arası veri akışını yöneten ana koordinatör.

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

## 📐 Sistem Mimarısı ve Veri Akışı

```text
  [ İstemci Tarayıcı ] 
           │
           ├── (1) HTTP İstekleri ──────────────► [ Security Middleware ]
           │                                            │
           │                                   (SQLi / IDOR / XSS Kontrolü)
           │                                            │
           │                                            ├─► [ PostgreSQL DB ]
           │                                            │
           └── (2) Real-time WebSockets ◄───────────────┴─► [ Socket.io Server ]
```

---

## 🎨 Dinamik Renk Temaları

İnceleyenlerin göz konforuna uygun 3 farklı canlı tema seçeneği sunulmuştur:
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