# BOT WA IMAGE TO PDF

Bot ini mengubah gambar yang dikirim ke WhatsApp menjadi file PDF otomatis.  
Dibangun menggunakan Baileys + Node.js.

---

# 1. PERSIAPAN AWAL (TERMUX)

```sh
pkg update && pkg upgrade -y
```

```sh
pkg install nodejs-lts -y
```

```sh
pkg install imagemagick -y
```

```sh
pkg install git -y
```

```sh
pkg install python -y
```

```sh
pkg install ffmpeg -y
```
```sh
git clone https://github.com/SRGilang21/pdf
---

# 2. MASUK KE FOLDER PROJECT

```sh
cd wa
```

---

# 3. INSTALISASI PROJECT

```sh
npm init -y
```

```sh
npm install @whiskeysockets/baileys
```

```sh
npm install pdf-lib
```

```sh
npm install qrcode-terminal
```

```sh
npm install @hapi/boom
```

---

# 4. STRUKTUR FOLDER PROJECT

Struktur minimal yang harus ada:

```
wa/
├── auth/                -> folder untuk menyimpan sesi WhatsApp (jangan hapus)
├── node_modules/        -> folder module otomatis dari npm
├── main.js              -> file utama bot
├── package.json
├── package-lock.json
└── README.md
```
# 5. CARA JALANKAN BOT

Pastikan kamu sudah berada di folder **wa**:

```sh
cd wa
```

Jalankan bot:

```sh
node main.js
```

Setelah itu:

- QR code akan muncul di terminal
- Scan menggunakan WhatsApp
- Bot langsung online

---
# 6. NOTE PENTING

- **Folder auth wajib disimpan** agar tidak perlu scan QR setiap restart.  
- Jika ganti device, hapus folder `auth/` lalu scan ulang.  
- Jangan jalankan lebih dari 1 sesi pada nomor WA yang sama.

---
