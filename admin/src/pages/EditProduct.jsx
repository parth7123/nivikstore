import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

const EditProduct = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);
  const [image5, setImage5] = useState(false);
  const [image6, setImage6] = useState(false);
  const [existingImages, setExistingImages] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Home & Kitchen");
  const [subCategory, setSubCategory] = useState("Kitchenware");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Category and subcategory mapping (same as in Add.jsx)
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

  // Size options based on category and subcategory (same as in Add.jsx)
  const getSizeOptions = () => {
    // ========== FOOTWEAR ==========
    if (category === "Footwear") {
      return Array.from({ length: 9 }, (_, i) => `${i + 6}`);
    }

    // ========== CLOTHES (MEN) ==========
    else if (category === "Clothes (Men)") {
      if (["T-Shirts", "Shirts", "Sweaters", "Jackets", "Formal Wear"].includes(subCategory)) {
        return ["S", "M", "L", "XL", "XXL", "XXXL", "3XL", "4XL", "5XL", "6XL"];
      }
      else if (["Pants", "Jeans", "Shorts"].includes(subCategory)) {
        return ["28", "30", "32", "34", "36", "38", "40", "42", "44", "46", "48", "50", "52", "54", "56", "58", "60", "Free size"];
      }
      return [
        "S", "M", "L", "XL", "XXL", "XXXL", "3XL", "4XL", "5XL", "6XL",
        "28", "30", "32", "34", "36", "38", "40", "42", "44", "46", "48", "50", "52", "54", "56", "58", "60",
      ];
    }

    // ========== CLOTHES (WOMEN) ==========
    else if (category === "Clothes (Women)") {
      if (["Dresses", "Tops & Blouses", "Sweaters", "Jackets", "Activewear"].includes(subCategory)) {
        return ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "3XL", "4XL", "5XL", "6XL"];
      }
      else if (["Pants & Jeans", "Skirts"].includes(subCategory)) {
        return ["26", "28", "30", "32", "34", "36", "38", "40", "42", "44", "46", "48"];
      }
      return [
        "XS", "S", "M", "L", "XL", "XXL", "XXXL", "3XL", "4XL", "5XL", "6XL",
        "26", "28", "30", "32", "34", "36", "38", "40", "42", "44", "46", "48"
      ];
    }

    // ========== CLOTHES (KIDS) ==========
    else if (category === "Clothes (Kids)") {
      if (subCategory === "Infant Wear") {
        return ["0-3 Months", "3-6 Months", "6-9 Months", "9-12 Months", "12-18 Months", "18-24 Months"];
      }
      else if (["Boys Clothing", "Girls Clothing", "School Uniforms", "Playwear"].includes(subCategory)) {
        return [
          "1-2 Years", "2-3 Years", "3-4 Years", "4-5 Years", "5-6 Years",
          "6-7 Years", "7-8 Years", "8-9 Years", "9-10 Years", "10-11 Years", "11-12 Years", "12-13 Years"
        ];
      }
      return [
        "0-3 Months", "3-6 Months", "6-9 Months", "9-12 Months", "12-18 Months", "18-24 Months",
        "1-2 Years", "2-3 Years", "3-4 Years", "4-5 Years", "5-6 Years",
        "6-7 Years", "7-8 Years", "8-9 Years", "9-10 Years", "10-11 Years", "11-12 Years", "12-13 Years"
      ];
    }

    // ========== UNDERGARMENTS (MEN) ==========
    else if (category === "Undergarments (Men)") {
      if (["Briefs", "Boxers"].includes(subCategory)) {
        return ["28", "30", "32", "34", "36", "38", "40", "42", "44", "46", "48", "50", "52", "54", "56", "58", "60"];
      }
      else if (["Vests", "Undershirts", "Thermal Wear"].includes(subCategory)) {
        return ["S", "M", "L", "XL", "XXL", "XXXL", "3XL", "4XL", "5XL", "6XL"];
      }
      return [
        "S", "M", "L", "XL", "XXL", "XXXL", "3XL", "4XL", "5XL", "6XL",
        "28", "30", "32", "34", "36", "38", "40", "42", "44", "46", "48", "50", "52", "54", "56", "58", "60"
      ];
    }

    // ========== UNDERGARMENTS (WOMEN) ==========
    else if (category === "Undergarments (Women)") {
      if (subCategory === "Bras") {
        return [
          "32A", "32B", "32C", "32D", "32DD", "34A", "34B", "34C", "34D", "34DD",
          "36A", "36B", "36C", "36D", "36DD", "38A", "38B", "38C", "38D", "38DD",
          "40A", "40B", "40C", "40D", "40DD", "42A", "42B", "42C", "42D", "42DD"
        ];
      }
      else if (subCategory === "Panties") {
        return ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "40", "42"];
      }
      else if (["Lingerie", "Shapewear", "Sleepwear"].includes(subCategory)) {
        return ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "3XL", "4XL"];
      }
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
      if (subCategory === "Baby Clothing") {
        return [
          "0-3 Months", "3-6 Months", "6-9 Months", "9-12 Months", "12-18 Months", "18-24 Months",
          "1-2 Years", "2-3 Years"
        ];
      }
      else if (subCategory === "Diapers & Wipes") {
        return ["Newborn", "S", "M", "L", "XL", "XXL"];
      }
      else if (subCategory === "Maternity") {
        return ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
      }
      else if (["Feeding", "Baby Care", "Nursery"].includes(subCategory)) {
        return ["50ml", "100ml", "150ml", "200ml", "250ml", "500ml", "1L", "One Size"];
      }
      return [
        "0-3 Months", "3-6 Months", "6-9 Months", "9-12 Months", "12-18 Months", "18-24 Months",
        "1-2 Years", "2-3 Years"
      ];
    }

    // ========== SPORTS & FITNESS ==========
    else if (category === "Sports & Fitness") {
      if (subCategory === "Sports Apparel") {
        return ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "3XL", "4XL", "5XL", "6XL"];
      }
      else if (["Fitness Equipment", "Sports Accessories", "Yoga & Pilates", "Outdoor Sports"].includes(subCategory)) {
        return ["Small", "Medium", "Large", "Extra Large", "One Size", "Standard"];
      }
      return ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "3XL", "4XL", "5XL", "6XL"];
    }

    // ========== TOYS ==========
    else if (category === "Toys") {
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
      if (subCategory === "Rings") {
        return ["Size 5", "Size 6", "Size 7", "Size 8", "Size 9", "Size 10", "Size 11", "Size 12", "Adjustable"];
      }
      else if (["Bracelets", "Anklets"].includes(subCategory)) {
        return ["Small (6 inch)", "Medium (7 inch)", "Large (8 inch)", "Extra Large (9 inch)", "Adjustable"];
      }
      else if (["Necklaces", "Earrings", "Watches"].includes(subCategory)) {
        return ["Small", "Medium", "Large", "Adjustable", "One Size"];
      }
      return ["Small", "Medium", "Large", "Adjustable", "One Size"];
    }

    // ========== BEAUTY & PERSONAL CARE ==========
    else if (category === "Beauty & Personal Care") {
      if (["Skincare", "Haircare", "Makeup", "Fragrances", "Personal Hygiene", "Grooming"].includes(subCategory)) {
        return ["50ml", "100ml", "150ml", "200ml", "250ml", "500ml", "1L", "One Size"];
      }
      return ["50ml", "100ml", "150ml", "200ml", "250ml", "500ml", "1L", "One Size"];
    }

    // ========== AIR FRESHENERS ==========
    else if (category === "Air Fresheners") {
      if (["Room Sprays", "Reed Diffusers", "Candles", "Gel Fresheners", "Automotive"].includes(subCategory)) {
        return ["50ml", "100ml", "150ml", "200ml", "250ml", "500ml", "1L"];
      }
      return ["50ml", "100ml", "150ml", "200ml", "250ml", "500ml", "1L"];
    }

    // ========== HEALTH & PERSONAL ==========
    else if (category === "Health & Personal") {
      if (["Vitamins & Supplements", "First Aid", "Health Monitors", "Personal Care Devices", "Wellness Products"].includes(subCategory)) {
        return ["50ml", "100ml", "150ml", "200ml", "250ml", "500ml", "1L", "One Size", "Standard"];
      }
      return ["50ml", "100ml", "150ml", "200ml", "250ml", "500ml", "1L", "One Size"];
    }

    // ========== MOBILE ACCESSORIES ==========
    else if (category === "Mobile Accessories") {
      if (["Phone Cases", "Screen Protectors"].includes(subCategory)) {
        return ["Universal", "One Size", "Model Specific"];
      }
      else if (["Chargers & Cables", "Headphones", "Power Banks", "Phone Stands"].includes(subCategory)) {
        return ["Universal", "One Size", "Small", "Medium", "Large", "Standard"];
      }
      return ["Universal", "One Size", "Small", "Medium", "Large"];
    }

    // ========== ELECTRONIC ==========
    else if (category === "Electronic") {
      if (["Mobile Phones", "Laptops", "Tablets", "Audio Devices", "Cameras", "Gaming Consoles"].includes(subCategory)) {
        return ["Standard", "One Size", "Model Specific"];
      }
      return ["Standard", "One Size", "Model Specific"];
    }

    // ========== ECO PRODUCTS ==========
    else if (category === "Eco Products") {
      if (subCategory === "Reusable Bags") {
        return ["Small", "Medium", "Large", "Extra Large", "One Size"];
      }
      else if (["Bamboo Products", "Organic Items", "Recycled Products", "Sustainable Living"].includes(subCategory)) {
        return ["Small", "Medium", "Large", "Extra Large", "One Size", "Standard"];
      }
      return ["Small", "Medium", "Large", "Extra Large", "One Size"];
    }

    // ========== GARDEN & OUTDOOR ==========
    else if (category === "Garden & Outdoor") {
      if (["Garden Tools", "Planters"].includes(subCategory)) {
        return ["Small", "Medium", "Large", "Extra Large", "One Size"];
      }
      else if (["Outdoor Furniture", "Outdoor Decor", "BBQ & Grilling"].includes(subCategory)) {
        return ["Small", "Medium", "Large", "Extra Large", "One Size", "Standard"];
      }
      return ["Small", "Medium", "Large", "Extra Large", "One Size"];
    }

    // ========== HOME & KITCHEN ==========
    else if (category === "Home & Kitchen") {
      if (["Kitchenware", "Cookware", "Dining & Serving"].includes(subCategory)) {
        return ["Small", "Medium", "Large", "Extra Large", "One Size"];
      }
      else if (["Storage & Organization", "Home Decor", "Bedding & Bath"].includes(subCategory)) {
        return ["Small", "Medium", "Large", "Extra Large", "One Size", "King Size", "Queen Size", "Single"];
      }
      return ["Small", "Medium", "Large", "Extra Large", "One Size"];
    }

    // ========== GIFTS ==========
    else if (category === "Gifts") {
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

  // Fetch product data when component mounts
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.post(backendUrl + '/api/product/single', { productId: id });
        if (response.data.success) {
          const product = response.data.product;
          setName(product.name);
          setDescription(product.description);
          setPrice(product.price);
          setCategory(product.category);
          setSubCategory(product.subCategory);
          setBestseller(product.bestseller);
          setSizes(product.sizes || []);
          setExistingImages(product.image || []);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch product data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    } else {
      setLoading(false);
    }
  }, [id]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();

      formData.append("id", id);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("existingImages", JSON.stringify(existingImages));

      // Only append new images if they exist
      if (image1) formData.append("image1", image1);
      if (image2) formData.append("image2", image2);
      if (image3) formData.append("image3", image3);
      if (image4) formData.append("image4", image4);
      if (image5) formData.append("image5", image5);
      if (image6) formData.append("image6", image6);

      const response = await axios.post(backendUrl + "/api/product/update", formData, { headers: { token } });

      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/list');
      } else {
        toast.error(response.data.message);
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = [...existingImages];
    newImages.splice(index, 1);
    setExistingImages(newImages);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
      <div>
        <p className='mb-2'>Product Images</p>
        <div className='flex flex-wrap gap-2 mb-4'>
          {/* Display existing images */}
          {existingImages.map((img, index) => (
            <div key={index} className='relative'>
              <img className='w-20 h-20 object-cover' src={img} alt="" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs'
              >
                X
              </button>
            </div>
          ))}
        </div>

        <p className='mb-2'>Upload New Images (Up to 6 images)</p>
        <div className='flex flex-wrap gap-2'>
          <label htmlFor="image1">
            <img className='w-20' src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="" />
            <input onChange={(e) => setImage1(e.target.files[0])} type="file" id="image1" hidden />
          </label>
          <label htmlFor="image2">
            <img className='w-20' src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="" />
            <input onChange={(e) => setImage2(e.target.files[0])} type="file" id="image2" hidden />
          </label>
          <label htmlFor="image3">
            <img className='w-20' src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="" />
            <input onChange={(e) => setImage3(e.target.files[0])} type="file" id="image3" hidden />
          </label>
          <label htmlFor="image4">
            <img className='w-20' src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="" />
            <input onChange={(e) => setImage4(e.target.files[0])} type="file" id="image4" hidden />
          </label>
          <label htmlFor="image5">
            <img className='w-20' src={!image5 ? assets.upload_area : URL.createObjectURL(image5)} alt="" />
            <input onChange={(e) => setImage5(e.target.files[0])} type="file" id="image5" hidden />
          </label>
          <label htmlFor="image6">
            <img className='w-20' src={!image6 ? assets.upload_area : URL.createObjectURL(image6)} alt="" />
            <input onChange={(e) => setImage6(e.target.files[0])} type="file" id="image6" hidden />
          </label>
        </div>
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product name</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className='w-full max-w-[500px] px-3 py-2'
          type="text"
          placeholder='Type here'
          required
        />
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product description</p>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className='w-full max-w-[500px] px-3 py-2'
          type="text"
          placeholder='Write content here'
          required
        />
      </div>

      <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
        <div>
          <p className='mb-2'>Product category</p>
          <select
            onChange={handleCategoryChange}
            value={category}
            className='w-full px-3 py-2'
          >
            {Object.keys(categorySubcategories).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <p className='mb-2'>Sub category</p>
          <select
            onChange={handleSubCategoryChange}
            value={subCategory}
            className='w-full px-3 py-2'
          >
            {categorySubcategories[category]?.map((subCat) => (
              <option key={subCat} value={subCat}>{subCat}</option>
            ))}
          </select>
        </div>

        <div>
          <p className='mb-2'>Product Price</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className='w-full px-3 py-2 sm:w-[120px]'
            type="Number"
            placeholder='25'
          />
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
        <input
          onChange={() => setBestseller(prev => !prev)}
          checked={bestseller}
          type="checkbox"
          id='bestseller'
        />
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
        {isUploading ? `${Math.round(uploadProgress)}%` : 'UPDATE'}
      </button>
    </form>
  );
};

export default EditProduct;