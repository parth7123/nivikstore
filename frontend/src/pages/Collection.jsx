import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Collection = () => {

  const { products , search , showSearch } = useContext(ShopContext);
  const [showFilter,setShowFilter] = useState(false);
  const [filterProducts,setFilterProducts] = useState([]);
  const [category,setCategory] = useState([]);
  const [subCategory,setSubCategory] = useState([]);
  const [sortType,setSortType] = useState('relavent');
  const [categorySearch, setCategorySearch] = useState('');
  const [subCategorySearch, setSubCategorySearch] = useState('');

  // Category and subcategory mapping (same as admin)
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

  // All available categories
  const allCategories = Object.keys(categorySubcategories);

  // Get subcategories for selected categories or all if none selected
  const getAvailableSubCategories = () => {
    if (category.length === 0) {
      // If no category selected, show all subcategories
      const allSubCats = new Set();
      Object.values(categorySubcategories).forEach(subCats => {
        subCats.forEach(subCat => allSubCats.add(subCat));
      });
      return Array.from(allSubCats).sort();
    } else {
      // Show subcategories only for selected categories
      const subCats = new Set();
      category.forEach(cat => {
        if (categorySubcategories[cat]) {
          categorySubcategories[cat].forEach(subCat => subCats.add(subCat));
        }
      });
      return Array.from(subCats).sort();
    }
  };

  const availableSubCategories = getAvailableSubCategories();

  // Filter categories by search
  const filteredCategories = allCategories.filter(cat => 
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Filter subcategories by search
  const filteredSubCategories = availableSubCategories.filter(subCat => 
    subCat.toLowerCase().includes(subCategorySearch.toLowerCase())
  );

  const toggleCategory = (e) => {

    if (category.includes(e.target.value)) {
        setCategory(prev=> prev.filter(item => item !== e.target.value))
    }
    else{
      setCategory(prev => [...prev,e.target.value])
    }

  }

  const toggleSubCategory = (e) => {

    if (subCategory.includes(e.target.value)) {
      setSubCategory(prev=> prev.filter(item => item !== e.target.value))
    }
    else{
      setSubCategory(prev => [...prev,e.target.value])
    }
  }

  const applyFilter = () => {

    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => category.includes(item.category));
    }

    if (subCategory.length > 0 ) {
      productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory))
    }

    setFilterProducts(productsCopy)

  }

  const sortProduct = () => {

    let fpCopy = filterProducts.slice();

    switch (sortType) {
      case 'low-high':
        setFilterProducts(fpCopy.sort((a,b)=>(a.price - b.price)));
        break;

      case 'high-low':
        setFilterProducts(fpCopy.sort((a,b)=>(b.price - a.price)));
        break;

      default:
        applyFilter();
        break;
    }

  }

  useEffect(()=>{
      applyFilter();
  },[category,subCategory,search,showSearch,products])

  useEffect(()=>{
    sortProduct();
  },[sortType])

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      
      {/* Filter Options */}
      <div className='min-w-60 sm:min-w-64'>
        <div className='flex items-center justify-between my-2'>
          <p onClick={()=>setShowFilter(!showFilter)} className='text-xl flex items-center cursor-pointer gap-2'>
            FILTERS
            <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
          </p>
          {(category.length > 0 || subCategory.length > 0) && (
            <button 
              onClick={() => {
                setCategory([]);
                setSubCategory([]);
              }}
              className='text-xs text-blue-600 hover:text-blue-800 underline'
            >
              Clear All
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className={`backdrop-blur-xl bg-white/30 border border-white/40 shadow-sm rounded-lg pl-5 py-3 mt-6 ${showFilter ? '' :'hidden'} sm:block max-h-96 overflow-y-auto`}>
          <p className='mb-3 text-sm font-medium sticky top-0 bg-white/0 pb-2 z-10 backdrop-blur-sm'>CATEGORIES</p>
          
          {/* Category Search */}
          <input
            type="text"
            placeholder="Search categories..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className='w-[90%] px-2 py-1 mb-3 text-xs backdrop-blur-xl bg-white/40 border border-white/50 rounded sticky top-8 z-10 focus:outline-none focus:ring-1 focus:ring-white/60 placeholder-gray-500'
          />
          
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => (
                <label key={cat} className='flex gap-2 cursor-pointer hover:text-gray-900'>
                  <input 
                    className='w-3 mt-1 cursor-pointer accent-pink-500' 
                    type="checkbox" 
                    value={cat} 
                    checked={category.includes(cat)}
                    onChange={toggleCategory}
                  /> 
                  <span className='flex-1'>{cat}</span>
                  {category.includes(cat) && categorySubcategories[cat] && (
                    <span className='text-xs text-gray-500'>({categorySubcategories[cat].length})</span>
                  )}
                </label>
              ))
            ) : (
              <p className='text-xs text-gray-500 py-2'>No categories found</p>
            )}
          </div>
        </div>

        {/* SubCategory Filter */}
        <div className={`backdrop-blur-xl bg-white/30 border border-white/40 shadow-sm rounded-lg pl-5 py-3 my-5 ${showFilter ? '' :'hidden'} sm:block max-h-96 overflow-y-auto`}>
          <p className='mb-3 text-sm font-medium sticky top-0 bg-white/0 pb-2 z-10 backdrop-blur-sm'>
            SUB-CATEGORIES {category.length > 0 && `(${category.length} selected)`}
          </p>
          
          {/* SubCategory Search */}
          <input
            type="text"
            placeholder="Search sub-categories..."
            value={subCategorySearch}
            onChange={(e) => setSubCategorySearch(e.target.value)}
            className='w-[90%] px-2 py-1 mb-3 text-xs backdrop-blur-xl bg-white/40 border border-white/50 rounded sticky top-8 z-10 focus:outline-none focus:ring-1 focus:ring-white/60 placeholder-gray-500'
          />
          
          {category.length === 0 && (
            <p className='text-xs text-gray-500 mb-2 italic'>Select a category to see specific sub-categories</p>
          )}
          
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            {filteredSubCategories.length > 0 ? (
              filteredSubCategories.map((subCat) => {
                // Check if this subcategory exists in products for the selected categories
                const hasProducts = category.length === 0 
                  ? products.some(p => p.subCategory === subCat)
                  : products.some(p => p.subCategory === subCat && category.includes(p.category));
                
                return (
                  <label key={subCat} className={`flex gap-2 cursor-pointer ${hasProducts ? 'hover:text-gray-900' : 'opacity-60'}`}>
                    <input 
                      className='w-3 mt-1 cursor-pointer accent-pink-500' 
                      type="checkbox" 
                      value={subCat} 
                      checked={subCategory.includes(subCat)}
                      onChange={toggleSubCategory}
                      disabled={!hasProducts && category.length > 0}
                    /> 
                    <span className='flex-1'>{subCat}</span>
                    {!hasProducts && category.length > 0 && (
                      <span className='text-xs text-gray-400'>(0)</span>
                    )}
                  </label>
                );
              })
            ) : (
              <p className='text-xs text-gray-500 py-2'>No sub-categories found</p>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {(category.length > 0 || subCategory.length > 0) && (
          <div className={`backdrop-blur-xl bg-blue-50/40 border border-blue-100/50 shadow-sm rounded-lg pl-5 py-3 my-5 ${showFilter ? '' :'hidden'} sm:block`}>
            <p className='mb-2 text-xs font-medium text-blue-800'>ACTIVE FILTERS:</p>
            <div className='flex flex-wrap gap-2'>
              {category.map((cat) => (
                <span 
                  key={cat}
                  onClick={() => setCategory(prev => prev.filter(c => c !== cat))}
                  className='text-xs bg-blue-200/60 text-blue-800 px-2 py-1 rounded cursor-pointer hover:bg-blue-300/60 backdrop-blur-sm'
                >
                  {cat} ×
                </span>
              ))}
              {subCategory.map((subCat) => (
                <span 
                  key={subCat}
                  onClick={() => setSubCategory(prev => prev.filter(s => s !== subCat))}
                  className='text-xs bg-green-200/60 text-green-800 px-2 py-1 rounded cursor-pointer hover:bg-green-300/60 backdrop-blur-sm'
                >
                  {subCat} ×
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Side */}
      <div className='flex-1'>

        <div className='flex justify-between text-base sm:text-2xl mb-4'>
            <Title text1={'ALL'} text2={'COLLECTIONS'} />
            {/* Porduct Sort */}
            <select onChange={(e)=>setSortType(e.target.value)} className='backdrop-blur-xl bg-white/30 border border-white/40 shadow-sm rounded text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-white/50'>
              <option value="relavent">Sort by: Relavent</option>
              <option value="low-high">Sort by: Low to High</option>
              <option value="high-low">Sort by: High to Low</option>
            </select>
        </div>

        {/* Results Count */}
        <div className='mb-4 text-sm text-gray-600'>
          {filterProducts.length > 0 ? (
            <p>Showing <span className='font-semibold'>{filterProducts.length}</span> product{filterProducts.length !== 1 ? 's' : ''}</p>
          ) : (
            <p className='text-gray-500'>No products found. Try adjusting your filters.</p>
          )}
        </div>

        {/* Map Products */}
        {filterProducts.length > 0 ? (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
            {
              filterProducts.map((item,index)=>(
                <ProductItem key={index} name={item.name} id={item._id} price={item.price} image={item.image} />
              ))
            }
          </div>
        ) : (
          <div className='text-center py-12'>
            <p className='text-gray-400 text-lg mb-2'>No products match your filters</p>
            <button 
              onClick={() => {
                setCategory([]);
                setSubCategory([]);
                setCategorySearch('');
                setSubCategorySearch('');
              }}
              className='text-blue-600 hover:text-blue-800 underline text-sm'
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

    </div>
  )
}

export default Collection
