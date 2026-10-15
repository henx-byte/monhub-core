# 🏠 Moonhub — Core

> Player yang clean, ringan, customable. Lu mau pake, monggo. Enggak, yaudah. Buat pajangan aja.

Ini cuma wadah aja. Gak ada source bajakan. Kosong.

Gue bikin ini karena gabut, pengen punya player sendiri yang bisa diisi apa aja pake extension.

**Landing page:** [moonhub.vercel.app](https://moonhub.vercel.app) — buat baca-baca aja, pajangan.

---

### Buat lu yang awam, ini bisa ngapain?

Bayangin lu punya rumah kosong. Di dalamnya udah ada:

- Rak buat nyimpen favorit
- TV buat nonton
- Meja baca buat baca

Tapi gak ada kaset, gak ada buku. Kosong.

Nah, extension itu kasetnya. Lu colok kasetnya, baru bisa nonton.

Lu bisa bikin kaset sendiri, misal kaset buat koleksi video pribadi lu di Google Drive.

### Buat lu yang penasaran pengen buat extension

Gak perlu `module.exports` ribet. Extension Moonhub cuma 1 file JSON:

```json
{
  "id": "punyaku",
  "name": "Punya Gue",
  "version": "1.0.0",
  "supportedTypes": ["ANIME"],
  "popularCode": "fetch('https://api.lu.com/popular').then(r => r.json())",
  "searchCode": "fetch('https://api.lu.com/search?q=' + query)...",
  "detailCode": "...",
  "streamCode": "..."
}
```

4 fungsi doang: `popular`, `search`, `detail`, `stream`. Kodenya lu tulis sebagai string JavaScript, nanti playernya yang jalanin.

Gak perlu build APK, gak perlu publish. Buat lu sendiri juga bisa.

### Kenapa dibikin kosong?

Biar aman. Gue gak mau ngedarin konten bajakan. Gue cuma nyediain core.

Lu yang punya kunci rumahnya. Lu yang tentuin mau diisi apa.

Kalo lu isi pake hal ilegal, itu tanggung jawab lu, bukan gue.

---

### FAQ

**Q: Ini bisa nonton anime gratis?**
A: Kalo lu bikin extension-nya yang nyari sumber gratis, ya bisa. Tapi gue gak nyediain.

**Q: Gimana cara install extension?**
A: Buka APK > Tab Extension > Import URL / File.

**Q: Gue bisa jualan extension?**
A: Bebas. Extension punya lu.

---

**Repo ini:** `moonhub-core` — core.
**Landing:** `moonhub.vercel.app` — etalase pajangannya.

> Dibuat sambil ngopi. ☕