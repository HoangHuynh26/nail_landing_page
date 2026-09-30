import { initDatabase, pool } from '../src/db/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await initDatabase();
  const viCols = await pool.query(
    "SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public' AND column_name LIKE '%_vi%'"
  );
  console.log('Columns matching _vi in Neon:', viCols.rows);

  const tables = ['categories', 'services', 'gallery', 'bookings', 'promotions', 'vouchers', 'schedule_locks', 'schedule_custom_slots', 'schedule_date_hours'];
  for (const t of tables) {
    const res = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position",
      [t]
    );
    console.log(t + ':', res.rows.map(r => r.column_name).join(', '));
  }
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
