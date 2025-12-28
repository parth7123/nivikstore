import dotenv from 'dotenv';
dotenv.config();

import express from 'express'
import cors from 'cors'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import shiprocketRouter from './routes/shiprocket.js'
import { initializeAutoTokenRefresh } from './services/shiprocket.service.js'
import { Server } from 'socket.io';
import http from 'http';

// App Config
const app = express()
const port = process.env.PORT || 4002
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

// middlewares
app.use(express.json())
app.use(cors())

// api endpoints
app.use('/api/user',userRouter)
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/order',orderRouter)
app.use('/api/shipping/shiprocket',shiprocketRouter)

app.get('/',(req,res)=>{
    res.send("API Working")
})
app.get('/api',(req,res)=>{
    res.send("API Working")
})

// Start server after database connection
const startServer = async () => {
    try {
        // Connect to database first
        console.log('Attempting to connect to MongoDB...')
        await connectDB()
        
        // Connect to cloudinary
        connectCloudinary()
        
        // Start server only after DB connection is successful
        server.listen(port, () => {
            console.log('Server started on PORT : ' + port)
            console.log('Server is ready to accept requests')
            
            // Initialize automatic Shiprocket token refresh
            initializeAutoTokenRefresh()
        })
    } catch (error) {
        console.error('\n❌ Failed to start server:', error.message)
        console.error('\n⚠️  Please check:')
        console.error('1. MongoDB Atlas IP whitelist - Add your IP address at: https://cloud.mongodb.com/')
        console.error('2. MONGODB_URI in .env file - Verify your connection string is correct')
        console.error('3. Network connectivity - Check your internet connection')
        console.error('4. MongoDB credentials - Verify username and password\n')
        process.exit(1)
    }
}

startServer()

export { io }