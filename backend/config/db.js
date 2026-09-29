import mongoose from 'mongoose';

const connectDB = async() => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('❌ MONGO_URI is missing in .env');
        process.exit(1);
    }

    try {
        mongoose.set('strictQuery', true);
        const conn = await mongoose.connect(uri);
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    }
};

export default connectDB;