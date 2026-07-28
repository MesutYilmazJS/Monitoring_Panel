const fs = require('fs');
const path = require('path');
const { pool } = require('./index');

async function runMigrations() {
  console.log('🔄 Veritabanı migration kontrolü başlatılıyor...');
  
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL çevre değişkeni bulunamadı, migration atlanıyor.');
    return;
  }

  let client;
  try {
    client = await pool.connect();
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      console.log(`📜 Migration kontrol ediliyor/uygulanıyor: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log(`✅ ${file} hazır.`);
    }

    console.log('🎉 Tüm veritabanı tabloları ve indeksleri başarıyla doğrulandı!');
  } catch (err) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch (e) {}
    }
    console.error('❌ Migration hatası:', err.message);
  } finally {
    if (client) client.release();
  }
}

if (require.main === module) {
  runMigrations().then(() => pool.end());
}

module.exports = runMigrations;
