const { sql } = require("./src/lib/db.cjs");

async function run() {
  try {
    await sql`ALTER TABLE hargi_ht2.asesment_bushing ADD COLUMN IF NOT EXISTS ultg TEXT`;
    await sql`ALTER TABLE hargi_ht2.asesment_bushing ADD COLUMN IF NOT EXISTS bulan TEXT`;
    console.log("Columns added successfully");
  } catch (err) {
    console.error("Error adding columns:", err);
  } finally {
    process.exit(0);
  }
}

run();
