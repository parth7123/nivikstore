import React, { useState, useEffect } from 'react'
import {assets} from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import io from 'socket.io-client';

const Add = ({token}) => {

  const [image1,setImage1] = useState(false)
  const [image2,setImage2] = useState(false)
  const [image3,setImage3] = useState(false)
  const [image4,setImage4] = useState(false)
  const [image5,setImage5] = useState(false)
  const [image6,setImage6] = useState(false)

   const [name, setName] = useState("");
   const [description, setDescription] = useState("");
   const [price, setPrice] = useState("");
   const [weight, setWeight] = useState(0.5);
   const [category, setCategory] = useState("Home & Kitchen");
   const [subCategory, setSubCategory] = useState("Kitchenware");
   const [bestseller, setBestseller] = useState(false);
   const [sizes, setSizes] = useState([]);
   const [uploadProgress, setUploadProgress] = useState(0);
   const [isUploading, setIsUploading] = useState(false);

   useEffect(() => {
     const socket = io(backendUrl);
     socket.on('upload-progress', (data) => {
       setUploadProgress(data.progress);
     });
   
     return () => {
       socket.disconnect();
     };
   }, []);

    // Size options based on category and subcategory (Indian Standards)
    const getSizeOptions = () => {
   // ========== FOOTWEAR ==========
   if (category === "Footwear") {
     // All footwear uses Indian shoe sizes
     return Array.from({ length: 9 }, (_, i) => `${i + 6}`);
   }
   
   // ========== CLOTHES (MEN) ==========
   else if (category === "Clothes (Men)") {
     // Tops/Upper body items
     if (["T-Shirts", "Shirts", "Sweaters", "Jackets", "Formal Wear"].includes(subCategory)) {
       return ["S", "M", "L", "XL", "XXL", "XXXL", "3XL", "4XL", "5XL", "6XL"];
     }
     // Bottom wear - waist sizes
     else if (["Pants", "Jeans", "Shorts"].includes(subCategory)) {
       return ["28", "30", "32", "34", "36", "38", "40", "42", "44", "46", "48", "50", "52", "54", "56", "58", "60","Free size"];
     }
     // Default: both sizes
     return [
       "S", "M", "L", "XL", "XXL", "XXXL", "3XL", "4XL", "5XL", "6XL",
       "28", "30", "32", "34", "36", "38", "40", "42", "44", "46", "48", "50", "52", "54", "56", "58", "60",
     ];
   }
   
   // ========== CLOTHES (WOMEN) ==========
   else if (category === "Clothes (Women)") {
     // Tops/Upper body items
     if (["Dresses", "Tops & Blouses", "Sweaters", "Jackets", "Activewear"].includes(subCategory)) {
       return ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "3XL", "4XL", "5XL", "6XL"];
     }
     // Bottom wear - waist sizes
     else if (["Pants & Jeans", "Skirts"].includes(subCategory)) {
       return ["26", "28", "30", "32", "34", "36", "38", "40", "42", "44", "46", "48"];
     }
     // Default: both sizes
     return [
       "XS", "S", "M", "L", "XL", "XXL", "XXXL", "3XL", "4XL", "5XL", "6XL",
       "26", "28", "30", "32", "34", "36", "38", "40", "42", "44", "46", "48"
     ];
   }
   
   // ========== CLOTHES (KIDS) ==========
   else if (category === "Clothes (Kids)") {
     // Infant wear - months
     if (subCategory === "Infant Wear") {
       return ["0-3 Months", "3-6 Months", "6-9 Months", "9-12 Months", "12-18 Months", "18-24 Months"];
     }
     // School uniforms and regular kids clothing - age ranges
     else if (["Boys Clothing", "Girls Clothing", "School Uniforms", "Playwear"].includes(subCategory)) {
       return [
         "1-2 Years", "2-3 Years", "3-4 Years", "4-5 Years", "5-6 Years",
         "6-7 Years", "7-8 Years", "8-9 Years", "9-10 Years", "10-11 Years", "11-12 Years", "12-13 Years"
       ];
     }
     // Default: all age ranges
     return [
       "0-3 Months", "3-6 Months", "6-9 Months", "9-12 Months", "12-18 Months", "18-24 Months",
       "1-2 Years", "2-3 Years", "3-4 Years", "4-5 Years", "5-6 Years",
       "6-7 Years", "7-8 Years", "8-9 Years", "9-10 Years", "10-11 Years", "11-12 Years", "12-13 Years"
     ];
   }
   
   // ========== UNDERgarments (MEN) ==========
   else if (category === "Undergarments (Men)") {
     // Bottom wear - waist sizes
     if (["Briefs", "Boxers"].includes(subCategory)) {
       return ["28", "30", "32", "34", "36", "38", "40", "42", "44", "46", "48", "50", "52", "54", "56", "58", "60"];
     }
     // Upper body - standard sizes
     else if (["Vests", "Undershirts", "Thermal Wear"].includes(subCategory)) {
       return ["S", "M", "L", "XL", "XXL", "XXXL", "3XL", "4XL", "5XL", "6XL"];
     }
     // Default: both
     return [
       "S", "M", "L", "XL", "XXL", "XXXL", "3XL", "4XL", "5XL", "6XL",
       "28", "30", "32", "34", "36", "38", "40", "42", "44", "46", "48", "50", "52", "54", "56", "58", "60"
     ];
   }
   
   // ========== UNDERgarments (WOMEN) ==========
   else if (category === "Undergarments (Women)") {
     // Bras - bra sizes
     if (subCategory === "Bras") {
       return [
         "32A", "32B", "32C", "32D", "32DD", "34A", "34B", "34C", "34D", "34DD",
         "36A", "36B", "36C", "36D", "36DD", "38A", "38B", "38C", "38D", "38DD",
         "40A", "40B", "40C", "40D", "40DD", "42A", "42B", "42C", "42D", "42DD"
       ];
     }
     // Panties - standard sizes
     else if (subCategory === "Panties") {
       return ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "40", "42"];
     }
     // Lingerie, Shapewear, Sleepwear - standard sizes
     else if (["Lingerie", "Shapewear", "Sleepwear"].includes(subCategory)) {
       return ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "3XL", "4XL"];
     }
     // Default: all options
     return [
       "XS", "S", "M", "L", "XL", "XXL", "XXXL", "3XL", "4XL", "5XL", "6XL",
       "28", "30", "32", "34", "36", "38", "40", "42", "44", "46", "48",
       "32A", "32B", "32C", "32D", "32DD", "34A", "34B", "34C", "34D", "34DD",
       "36A", "36B", "36C", "36D", "36DD", "38A", "38B", "38C", "38D", "38DD",
       "40A", "40B", "40C", "40D", "40DD", "42A", "42B", "42C", "42D", "42DD"
     ];
   }
   
   // ========== MOM & BABY ==========
   else if (category === "Mom & Baby") {
     // Baby clothing - age-based
     if (subCategory === "Baby Clothing") {
       return [
         "0-3 Months", "3-6 Months", "6-9 Months", "9-12 Months", "12-18 Months", "18-24 Months",
         "1-2 Years", "2-3 Years"
       ];
     }
     // Diapers - size numbers
     else if (subCategory === "Diapers & Wipes") {
       return ["Newborn", "S", "M", "L", "XL", "XXL"];
     }
     // Maternity - standard sizes
     else if (subCategory === "Maternity") {
       return ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
     }
     // Feeding, Baby Care, Nursery - capacity/one size
     else if (["Feeding", "Baby Care", "Nursery"].includes(subCategory)) {
       return ["50ml", "100ml", "150ml", "200ml", "250ml", "500ml", "1L", "One Size"];
     }
     // Default: age-based
     return [
       "0-3 Months", "3-6 Months", "6-9 Months", "9-12 Months", "12-18 Months", "18-24 Months",
       "1-2 Years", "2-3 Years"
     ];
   }
   
   // ========== SPORTS & FITNESS ==========
   else if (category === "Sports & Fitness") {
     // Sports apparel - standard sizes
     if (subCategory === "Sports Apparel") {
       return ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "3XL", "4XL", "5XL", "6XL"];
     }
     // Fitness equipment, accessories - one size or standard
     else if (["Fitness Equipment", "Sports Accessories", "Yoga & Pilates", "Outdoor Sports"].includes(subCategory)) {
       return ["Small", "Medium", "Large", "Extra Large", "One Size", "Standard"];
     }
     // Default: standard sizes
     return ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "3XL", "4XL", "5XL", "6XL"];
   }
   
   // ========== TOYS ==========
   else if (category === "Toys") {
     // All toys - age-based
     if (["Action Figures", "Board Games", "Educational Toys", "Outdoor Toys", "Puzzles", "Soft Toys", "Electronic Toys"].includes(subCategory)) {
       return [
         "0-6 Months", "6-12 Months", "1-2 Years", "2-3 Years", "3-4 Years",
         "4-5 Years", "5-6 Years", "6-8 Years", "8-10 Years", "10-12 Years", "12+ Years"
       ];
     }
     return [
       "0-6 Months", "6-12 Months", "1-2 Years", "2-3 Years", "3-4 Years",
       "4-5 Years", "5-6 Years", "6-8 Years", "8-10 Years", "10-12 Years", "12+ Years"
     ];
   }
   
   // ========== JEWELLERY ==========
   else if (category === "Jewellery") {
     // Rings - specific sizes
     if (subCategory === "Rings") {
       return ["Size 5", "Size 6", "Size 7", "Size 8", "Size 9", "Size 10", "Size 11", "Size 12", "Adjustable"];
     }
     // Bracelets, Anklets - sizes
     else if (["Bracelets", "Anklets"].includes(subCategory)) {
       return ["Small (6 inch)", "Medium (7 inch)", "Large (8 inch)", "Extra Large (9 inch)", "Adjustable"];
     }
     // Necklaces, Earrings, Watches - standard
     else if (["Necklaces", "Earrings", "Watches"].includes(subCategory)) {
       return ["Small", "Medium", "Large", "Adjustable", "One Size"];
     }
     return ["Small", "Medium", "Large", "Adjustable", "One Size"];
   }
   
   // ========== BEAUTY & PERSONAL CARE ==========
   else if (category === "Beauty & Personal Care") {
     // All subcategories - capacity based
     if (["Skincare", "Haircare", "Makeup", "Fragrances", "Personal Hygiene", "Grooming"].includes(subCategory)) {
       return ["50ml", "100ml", "150ml", "200ml", "250ml", "500ml", "1L", "One Size"];
     }
     return ["50ml", "100ml", "150ml", "200ml", "250ml", "500ml", "1L", "One Size"];
   }
   
   // ========== AIR FRESHENERS ==========
   else if (category === "Air Fresheners") {
     // All subcategories - capacity based
     if (["Room Sprays", "Reed Diffusers", "Candles", "Gel Fresheners", "Automotive"].includes(subCategory)) {
       return ["50ml", "100ml", "150ml", "200ml", "250ml", "500ml", "1L"];
     }
     return ["50ml", "100ml", "150ml", "200ml", "250ml", "500ml", "1L"];
   }
   
   // ========== HEALTH & PERSONAL ==========
   else if (category === "Health & Personal") {
     // Vitamins, First Aid, Health Monitors - varies
     if (["Vitamins & Supplements", "First Aid", "Health Monitors", "Personal Care Devices", "Wellness Products"].includes(subCategory)) {
       return ["50ml", "100ml", "150ml", "200ml", "250ml", "500ml", "1L", "One Size", "Standard"];
     }
     return ["50ml", "100ml", "150ml", "200ml", "250ml", "500ml", "1L", "One Size"];
   }
   
   // ========== MOBILE ACCESSORIES ==========
   else if (category === "Mobile Accessories") {
     // Phone cases, screen protectors - model specific
     if (["Phone Cases", "Screen Protectors"].includes(subCategory)) {
       return ["Universal", "One Size", "Model Specific"];
     }
     // Chargers, cables, headphones, power banks, phone stands - standard
     else if (["Chargers & Cables", "Headphones", "Power Banks", "Phone Stands"].includes(subCategory)) {
       return ["Universal", "One Size", "Small", "Medium", "Large", "Standard"];
     }
     return ["Universal", "One Size", "Small", "Medium", "Large"];
   }
   
   // ========== ELECTRONIC ==========
   else if (category === "Electronic") {
     // All electronics - model specific
     if (["Mobile Phones", "Laptops", "Tablets", "Audio Devices", "Cameras", "Gaming Consoles"].includes(subCategory)) {
       return ["Standard", "One Size", "Model Specific"];
     }
     return ["Standard", "One Size", "Model Specific"];
   }
   
   // ========== ECO PRODUCTS ==========
   else if (category === "Eco Products") {
     // Reusable bags - sizes
     if (subCategory === "Reusable Bags") {
       return ["Small", "Medium", "Large", "Extra Large", "One Size"];
     }
     // Other eco products
     else if (["Bamboo Products", "Organic Items", "Recycled Products", "Sustainable Living"].includes(subCategory)) {
       return ["Small", "Medium", "Large", "Extra Large", "One Size", "Standard"];
     }
     return ["Small", "Medium", "Large", "Extra Large", "One Size"];
   }
   
   // ========== GARDEN & OUTDOOR ==========
   else if (category === "Garden & Outdoor") {
     // Garden tools, planters - sizes
     if (["Garden Tools", "Planters"].includes(subCategory)) {
       return ["Small", "Medium", "Large", "Extra Large", "One Size"];
     }
     // Outdoor furniture, decor, BBQ - standard
     else if (["Outdoor Furniture", "Outdoor Decor", "BBQ & Grilling"].includes(subCategory)) {
       return ["Small", "Medium", "Large", "Extra Large", "One Size", "Standard"];
     }
     return ["Small", "Medium", "Large", "Extra Large", "One Size"];
   }
   
   // ========== HOME & KITCHEN ==========
   else if (category === "Home & Kitchen") {
     // Kitchenware, cookware, dining - sizes
     if (["Kitchenware", "Cookware", "Dining & Serving"].includes(subCategory)) {
       return ["Small", "Medium", "Large", "Extra Large", "One Size"];
     }
     // Storage, home decor, bedding - sizes
     else if (["Storage & Organization", "Home Decor", "Bedding & Bath"].includes(subCategory)) {
       return ["Small", "Medium", "Large", "Extra Large", "One Size", "King Size", "Queen Size", "Single"];
     }
     return ["Small", "Medium", "Large", "Extra Large", "One Size"];
   }
   
   // ========== GIFTS ==========
   else if (category === "Gifts") {
     // All gift subcategories
     if (["Gift Sets", "Personalized Gifts", "Novelty Items", "Gift Cards", "Occasion Gifts"].includes(subCategory)) {
       return ["Small", "Medium", "Large", "One Size"];
     }
     return ["Small", "Medium", "Large", "One Size"];
   }
   
   // ========== DEFAULT FALLBACK ==========
   else {
     return ["Small", "Medium", "Large", "Extra Large", "One Size"];
   }
 };

 // Category and subcategory mapping
 const categorySubcategories = {
   "Home & Kitchen": ["Kitchenware", "Cookware", "Dining & Serving", "Storage & Organization", "Home Decor", "Bedding & Bath"],
   "Beauty & Personal Care": ["Skincare", "Haircare", "Makeup", "Fragrances", "Personal Hygiene", "Grooming"],
   "Clothes (Men)": ["T-Shirts", "Shirts", "Pants", "Jeans", "Shorts", "Jackets", "Sweaters", "Formal Wear"],
   "Clothes (Women)": ["Dresses", "Tops & Blouses", "Pants & Jeans", "Skirts", "Jackets", "Sweaters", "Activewear"],
   "Clothes (Kids)": ["Boys Clothing", "Girls Clothing", "Infant Wear", "School Uniforms", "Playwear"],
   "Toys": ["Action Figures", "Board Games", "Educational Toys", "Outdoor Toys", "Puzzles", "Soft Toys", "Electronic Toys"],
   "Mom & Baby": ["Baby Clothing", "Diapers & Wipes", "Feeding", "Baby Care", "Nursery", "Maternity"],
   "Undergarments (Women)": ["Bras", "Panties", "Lingerie", "Shapewear", "Sleepwear"],
   "Undergarments (Men)": ["Briefs", "Boxers", "Vests", "Undershirts", "Thermal Wear"],
   "Electronic": ["Mobile Phones", "Laptops", "Tablets", "Audio Devices", "Cameras", "Gaming Consoles"],
   "Gifts": ["Gift Sets", "Personalized Gifts", "Novelty Items", "Gift Cards", "Occasion Gifts"],
   "Mobile Accessories": ["Phone Cases", "Screen Protectors", "Chargers & Cables", "Headphones", "Power Banks", "Phone Stands"],
   "Eco Products": ["Reusable Bags", "Bamboo Products", "Organic Items", "Recycled Products", "Sustainable Living"],
   "Garden & Outdoor": ["Garden Tools", "Outdoor Furniture", "Planters", "BBQ & Grilling", "Outdoor Decor"],
   "Sports & Fitness": ["Fitness Equipment", "Sports Apparel", "Sports Accessories", "Yoga & Pilates", "Outdoor Sports"],
   "Air Fresheners": ["Room Sprays", "Reed Diffusers", "Candles", "Gel Fresheners", "Automotive"],
   "Jewellery": ["Necklaces", "Earrings", "Rings", "Bracelets", "Watches", "Anklets"],
   "Footwear": ["Sneakers", "Casual Shoes", "Formal Shoes", "Sandals", "Boots", "Sports Shoes"],
   "Health & Personal": ["Vitamins & Supplements", "First Aid", "Health Monitors", "Personal Care Devices", "Wellness Products"]
 };

 // Update subcategory when category changes
 const handleCategoryChange = (e) => {
   const newCategory = e.target.value;
   setCategory(newCategory);
   // Set first subcategory as default
   if (categorySubcategories[newCategory] && categorySubcategories[newCategory].length > 0) {
     setSubCategory(categorySubcategories[newCategory][0]);
   }
   // Clear sizes when category changes to prevent incorrect selections
   setSizes([]);
 };

 // Update subcategory and clear sizes when subcategory changes
 const handleSubCategoryChange = (e) => {
   setSubCategory(e.target.value);
   // Clear sizes when subcategory changes to prevent incorrect selections
   setSizes([]);
 };

   const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const formData = new FormData()

      formData.append("name",name)
      formData.append("description",description)
      formData.append("price",price)
      formData.append("weight",weight)
      formData.append("category",category)
      formData.append("subCategory",subCategory)
      formData.append("bestseller",bestseller)
      formData.append("sizes",JSON.stringify(sizes))

      formData.append("image1",image1)
      formData.append("image2",image2)
      formData.append("image3",image3)
      formData.append("image4",image4)
      formData.append("image5",image5)
      formData.append("image6",image6)

      const response = await axios.post(backendUrl + "/api/product/add",formData,{headers:{token}})

      if (response.data.success) {
        toast.success(response.data.message)
        setName('')
        setDescription('')
        setImage1(false)
        setImage2(false)
        setImage3(false)
        setImage4(false)
        setImage5(false)
        setImage6(false)
        setPrice('')
        setWeight(0.5)
        setUploadProgress(0);
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message)
    } finally {
      setIsUploading(false);
    }
   }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
        <div>
          <p className='mb-2'>Upload Image (Up to 6 images)</p>

          <div className='flex flex-wrap gap-2'>
            <label htmlFor="image1">
              <img className='w-20' src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="" />
              <input onChange={(e)=>setImage1(e.target.files[0])} type="file" id="image1" hidden/>
            </label>
            <label htmlFor="image2">
              <img className='w-20' src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="" />
              <input onChange={(e)=>setImage2(e.target.files[0])} type="file" id="image2" hidden/>
            </label>
            <label htmlFor="image3">
              <img className='w-20' src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="" />
              <input onChange={(e)=>setImage3(e.target.files[0])} type="file" id="image3" hidden/>
            </label>
            <label htmlFor="image4">
              <img className='w-20' src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="" />
              <input onChange={(e)=>setImage4(e.target.files[0])} type="file" id="image4" hidden/>
            </label>
            <label htmlFor="image5">
              <img className='w-20' src={!image5 ? assets.upload_area : URL.createObjectURL(image5)} alt="" />
              <input onChange={(e)=>setImage5(e.target.files[0])} type="file" id="image5" hidden/>
            </label>
            <label htmlFor="image6">
              <img className='w-20' src={!image6 ? assets.upload_area : URL.createObjectURL(image6)} alt="" />
              <input onChange={(e)=>setImage6(e.target.files[0])} type="file" id="image6" hidden/>
            </label>
          </div>
        </div>

        <div className='w-full'>
          <p className='mb-2'>Product name</p>
          <input onChange={(e)=>setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Type here' required/>
        </div>

        <div className='w-full'>
          <p className='mb-2'>Product description</p>
          <textarea onChange={(e)=>setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Write content here' required/>
        </div>

        <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>

            <div>
              <p className='mb-2'>Product category</p>
              <select onChange={handleCategoryChange} value={category} className='w-full px-3 py-2'>
                  <option value="Home & Kitchen">Home & Kitchen</option>
                  <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                  <option value="Clothes (Men)">Clothes (Men)</option>
                  <option value="Clothes (Women)">Clothes (Women)</option>
                  <option value="Clothes (Kids)">Clothes (Kids)</option>
                  <option value="Toys">Toys</option>
                  <option value="Mom & Baby">Mom & Baby</option>
                  <option value="Undergarments (Women)">Undergarments (Women)</option>
                  <option value="Undergarments (Men)">Undergarments (Men)</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Gifts">Gifts</option>
                  <option value="Mobile Accessories">Mobile Accessories</option>
                  <option value="Eco Products">Eco Products</option>
                  <option value="Garden & Outdoor">Garden & Outdoor</option>
                  <option value="Sports & Fitness">Sports & Fitness</option>
                  <option value="Air Fresheners">Air Fresheners</option>
                  <option value="Jewellery">Jewellery</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Health & Personal">Health & Personal</option>
              </select>
            </div>

            <div>
              <p className='mb-2'>Sub category</p>
              <select onChange={handleSubCategoryChange} value={subCategory} className='w-full px-3 py-2'>
                  {categorySubcategories[category]?.map((subCat) => (
                    <option key={subCat} value={subCat}>{subCat}</option>
                  ))}
              </select>
            </div>

            <div>
              <p className='mb-2'>Product Price</p>
              <input onChange={(e) => setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px]' type="Number" placeholder='25' />
            </div>

            <div>
              <p className='mb-2'>Product Weight (kg)</p>
              <input onChange={(e) => setWeight(e.target.value)} value={weight} className='w-full px-3 py-2 sm:w-[120px]' type="Number" step="0.01" placeholder='0.5' />
            </div>

        </div>

        <div>
          <p className='mb-2'>Product Sizes</p>
          <div className='flex flex-wrap gap-3 max-h-60 overflow-y-auto'>
            {[...new Set([...getSizeOptions(), "Free size "])].map((size) => (
              <div 
                key={size} 
                onClick={() => setSizes(prev => 
                  prev.includes(size) 
                    ? prev.filter(item => item !== size) 
                    : [...prev, size]
                )}
              >
                <p className={`${sizes.includes(size) ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer hover:bg-pink-50 transition-colors`}>
                  {size}
                </p>
              </div>
            ))}
          </div>
          {sizes.length > 0 && (
            <p className='mt-2 text-sm text-gray-500'>
              Selected: {sizes.join(", ")}
            </p>
          )}
        </div>

        <div className='flex gap-2 mt-2'>
          <input onChange={() => setBestseller(prev => !prev)} checked={bestseller} type="checkbox" id='bestseller' />
          <label className='cursor-pointer' htmlFor="bestseller">Add to bestseller</label>
        </div>

        <button 
          type="submit" 
          className={`w-28 py-3 mt-4 text-white transition-all duration-300 ${
            isUploading 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-black hover:bg-gray-800'
          }`}
          disabled={isUploading}
        >
          {isUploading ? `${Math.round(uploadProgress)}%` : 'ADD'}
        </button>

    </form>
  )
}

export default Add