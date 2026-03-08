import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import routes from './routes/index.js'
import { initDB } from './config/db.js'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 8000

const allowedOrigins = [process.env.FRONTEND_URL ,'http://localhost:5173/'];

app.use(cors({
  origin : allowedOrigins ,
  credentials : true,
})); 
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use('/api', routes)

app.get('/', (req, res) => {
  res.send('🚗 Car Rental API ')
})

const startServer = async () => {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}
startServer();
