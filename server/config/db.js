import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

let pool;

const initDB = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    const connection = await pool.getConnection();
    console.log("MySQL database connected successfully");
    connection.release();
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
    process.exit(1);
  }
};

const getDB = () => {
  if (!pool) {
    throw new Error("Database not initialized. Call initDB() first.");
  }
  return pool;
};

export { initDB, getDB };