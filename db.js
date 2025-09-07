const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",          // your postgres user
  host: "localhost",
  database: "music-library", // the db you created in pgAdmin
  password: "postgres",
  port: 5432,
});

// optional test
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database connection error", err.stack);
  } else {
    console.log("✅ Database connected at", res.rows[0].now);
  }
});

module.exports = pool;
