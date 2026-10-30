# TokoKami
Web App e-commerce atau toko online yang sangat fluid dan flexibel karna bisa di gunakan untuk semua product yang di butuhkan tinggal mengkastomisasi tema dan lain-lain untuk membuat nya lebih spesial. Mengunakan framework laravel 13 dengan react starter kit untuk front end sehingga UI terlihat lebih bersih dan lebih smooth. 

## Tech Stack
- laravel 13
- react 3

## Requirement
- php 8.4^
- node 22.17.1^
- npm 10.9.2^
- npx 10.9.2^

## Project Setup
- Clone repositori
```bash
git clone https://github.com/FarelNandaS/TokoKami.git #jika ingin mengunakan https
```
```bash
git clone git@github.com:FarelNandaS/TokoKami.git #jika ingin mengunakan ssh
```

- Masuk ke folder yang sudah di clone
```bash
cd TokoKami
```

- Copy .env tamplate
```bash
copy .env.example .env #untuk windows
```
```bash
cp .env.example .env #untuk linux / mac
```

- Jalankan setup laravel
```bash
composer run setup
```

- Cek dan edit file .env agar cocok dengan kebutuhan anda

- Jalankan seeder untuk membuat super admin
```bash
php artisan db:seeder
```

- Jalankan project nya
```bash
composer run dev
```

## Troubleshooting & Developer Note
1. Untuk bisa masuk ke admin dashboard setelah seeder email nya SuperAdmin@gmail.com dan password nya password.

2. Jika ada error forbidden saat setelah "migrate:fresh --seed" bisa jalankan perintah "php artisan permission:cache-reset" karna masalah nya di cache milik permission spite yang masih menyimpan permission yang lama bukan yang baru di buat.