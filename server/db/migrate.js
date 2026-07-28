const fs = require('fs');
const path = require('path');
const { pool } = require('./index');

async function runMigrations() {
  console.log('🔄 Veritabanı migration başlatılıyor...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ HATA: DATABASE_URL çevre değişkeni tanımlı değil! Lütfen .env dosyasını kontrol edin.');
    process.exit(1);
  }

  const client = await pool.connect();

  try {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      console.log(`📜 Migration çalıştırılıyor: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log(`✅ ${file} başarıyla uygulandı.`);
    }

    console.log('🎉 Tüm migration işlemleri tamamlandı!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration hatası:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
