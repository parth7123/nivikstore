import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"

// function for add product
const addProduct = async (req, res) => {
    try {
        
        const { name, description, price, category, subCategory, sizes, bestseller, weight } = req.body
        
        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]
        const image5 = req.files.image5 && req.files.image5[0]
        const image6 = req.files.image6 && req.files.image6[0]

        const images = [image1, image2, image3, image4, image5, image6].filter(item => item !== undefined)
        
        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url;
            })
        )

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now(),
            weight: weight ? Number(weight) : 0.5
        }

        const product = new productModel(productData);
        await product.save()

        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for list product
const listProducts = async (req, res) => {
    try {
        
        const products = await productModel.find({});
        res.json({success:true,products})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for removing product
const removeProduct = async (req, res) => {
    try {
        
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true,message:"Product Removed"})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {
        
        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({success:true,product})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for updating product
const updateProduct = async (req, res) => {
    try {
        const { id, name, description, price, category, subCategory, sizes, bestseller, existingImages, weight } = req.body;
        
        // Parse existing images if provided
        let imagesUrl = existingImages ? JSON.parse(existingImages) : [];
        
        // Upload new images if provided
        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]
        const image5 = req.files.image5 && req.files.image5[0]
        const image6 = req.files.image6 && req.files.image6[0]

        const newImages = [image1, image2, image3, image4, image5, image6].filter(item => item !== undefined)
        
        // Upload new images to Cloudinary
        for (let i = 0; i < newImages.length; i++) {
            const item = newImages[i];
            try {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                imagesUrl.push(result.secure_url);
            } catch (uploadError) {
                console.error(`Error uploading image ${i + 1}:`, uploadError);
                throw uploadError;
            }
        }

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            weight: weight ? Number(weight) : 0.5
        }

        const product = await productModel.findByIdAndUpdate(id, productData, { new: true });
        res.json({ success: true, message: "Product Updated", product })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { listProducts, addProduct, removeProduct, singleProduct, updateProduct }