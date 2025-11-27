import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import productModel from './models/productModel.js';
import connectDB from './config/mongodb.js';

const auditProducts = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        const products = await productModel.find({});
        console.log(`Found ${products.length} products.`);

        if (products.length === 0) {
            console.log('No products found.');
        } else {
            products.forEach(p => {
                console.log(`Product: ${p.name}`);
                console.log(`  Price: ${p.price}`);
                console.log(`  Description: ${p.description.substring(0, 50)}...`);
                console.log(`  Category: ${p.category}`);
                console.log(`  SubCategory: ${p.subCategory}`);
                console.log(`  Sizes: ${p.sizes}`);
                console.log(`  Images: ${p.image}`);
                console.log(`  Date: ${p.date}`);
                console.log('---');
            });
        }
        process.exit(0);
    } catch (error) {
        console.error('Error auditing products:', error);
        process.exit(1);
    }
};

auditProducts();
