import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log("DB Connected");
        });

        mongoose.connection.on('error', (err) => {
            console.error("MongoDB connection error:", err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log("MongoDB disconnected");
        });

        const mongoURI = process.env.MONGODB_URI;
        
        if (!mongoURI) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }

        // Clean the URI - remove trailing slash if present
        const cleanURI = mongoURI.endsWith('/') ? mongoURI.slice(0, -1) : mongoURI;
        
        await mongoose.connect(cleanURI, {
            serverSelectionTimeoutMS: 5000, // 5 seconds for faster feedback
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            maxPoolSize: 10,
            retryWrites: true,
            w: 'majority',
            // Add these options to help with SSL/TLS issues
            tls: true,
            tlsAllowInvalidCertificates: false
        });

        console.log("MongoDB connection established successfully");
    } catch (error) {
        console.error("\n❌ MongoDB Connection Error:", error.message);
        
        // Check for specific error types
        if (error.name === 'MongooseServerSelectionError' || 
            error.message.includes('IP') || 
            error.message.includes('whitelist') ||
            error.message.includes('Could not connect')) {
            console.error("\n⚠️  IP Whitelist Issue Detected:");
            console.error("Your IP address is not whitelisted in MongoDB Atlas.");
            console.error("\n📝 Steps to fix:");
            console.error("1. Go to: https://cloud.mongodb.com/");
            console.error("2. Navigate to: Network Access → Add IP Address");
            console.error("3. Click 'Add Current IP Address' or add '0.0.0.0/0' (for development only)");
            console.error("4. Wait 1-2 minutes for changes to propagate\n");
        }
        
        if (error.message.includes('SSL') || 
            error.message.includes('TLS') || 
            error.message.includes('ERR_SSL') ||
            error.cause?.code === 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR') {
            console.error("\n⚠️  SSL/TLS Connection Issue:");
            console.error("There's a problem with the SSL/TLS handshake.");
            console.error("This often happens when:");
            console.error("- IP address is not whitelisted");
            console.error("- Connection string is incorrect");
            console.error("- Network firewall is blocking the connection");
            console.error("\n💡 Try: Whitelist your IP address in MongoDB Atlas first\n");
        }
        
        if (error.message.includes('authentication failed') || 
            error.message.includes('bad auth')) {
            console.error("\n⚠️  Authentication Issue:");
            console.error("MongoDB username or password is incorrect.");
            console.error("Please check your MONGODB_URI connection string.\n");
        }
        
        if (!mongoURI) {
            console.error("\n⚠️  Missing Environment Variable:");
            console.error("MONGODB_URI is not set in your .env file.");
            console.error("Please create a .env file with: MONGODB_URI=your_connection_string\n");
        }
        
        throw error;
    }
}

export default connectDB;