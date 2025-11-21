import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Heart } from "lucide-react";
import { getOptimizedImageUrl, handleImageError, getAspectRatioStyle } from "../../utils/imageUtils";
import CartContext from "../../context/CartContext";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useContext(CartContext);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const productImage = getOptimizedImageUrl(product, 'card');
  const productPrice = product.sale_price || product.price;
  const originalPrice = product.price;
  const hasDiscount =
    product.sale_price &&
    parseFloat(product.sale_price) < parseFloat(product.price);
  const rating = product.rating || 4; // Default rating
  const reviews = product.reviews || 0; // Default reviews

  const handleProductClick = (e) => {
    // Prevent navigation if clicking on buttons
    if (e?.target?.closest('button')) {
      return;
    }
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    if (isAddingToCart || product.stock_quantity <= 0) return;
    
    try {
      setIsAddingToCart(true);
      await addToCart(product, 1);
      
      // Show success feedback (you could add a toast notification here)
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Show error feedback
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async (e) => {
    e.stopPropagation();
    
    if (product.stock_quantity <= 0) return;
    
    try {
      // Check if product is already in cart
      const existingItem = cartItems.find(item => item.id === product.id);
      
      if (!existingItem) {
        // Only add to cart if not already present
        await addToCart(product, 1);
      }
      
      // Always navigate to cart regardless
      navigate("/cart");
    } catch (error) {
      console.error('Error with buy now:', error);
    }
  };

  return (
    <motion.div
      className="relative h-64 sm:h-80 rounded-2xl overflow-hidden shadow-lg cursor-pointer group bg-black border border-gray-800"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "easeOut", duration: 0.25 }}
      onClick={(e) => handleProductClick(e)}
    >
      {/* Product Image */}
      <motion.img
        src={productImage}
        alt={product.name}
        className="w-full h-full object-cover"
        style={getAspectRatioStyle('1/1')}
        onError={handleImageError}
        whileHover={{ scale: 1.1 }}
        transition={{ type: "easeOut", duration: 0.25 }}
      />

      {/* Badges */}
      <div className="absolute top-3 left-3 flex gap-2 z-10">
        {hasDiscount && (
          <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
            Sale
          </div>
        )}
        {product.is_new_arrival && (
          <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
            New
          </div>
        )}
      </div>

      {/* Wishlist Icon - Always Visible */}
      <motion.button
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg z-20 transition-colors"
      >
        <Heart className="w-5 h-5" />
      </motion.button>

      {/* Hover Overlay - Reveal on Hover */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileHover={{ opacity: 1, y: 0 }}
        transition={{ type: "easeOut", duration: 0.25 }}
        className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent flex flex-col justify-end p-4"
      >
        {/* Brand Name */}
        <div className="text-red-500 text-xs font-bold uppercase tracking-wider mb-1">
          {product.brand_name}
        </div>

        {/* Product Name */}
        <h3 className="text-white font-bold text-sm mb-3 line-clamp-2 leading-tight">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mb-4">
          {hasDiscount ? (
            <div className="flex items-center gap-2">
              <p className="text-red-500 font-bold text-lg">
                Rs. {parseFloat(productPrice).toLocaleString()}
              </p>
              <p className="text-gray-400 text-xs line-through">
                Rs. {parseFloat(originalPrice).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-red-500 font-bold text-lg">
              Rs. {parseFloat(productPrice).toLocaleString()}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock_quantity <= 0}
            className={`flex-1 rounded-lg flex items-center justify-center gap-2 py-2 font-semibold text-sm transition-colors ${
              product.stock_quantity <= 0
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                : isAddingToCart
                ? 'bg-orange-600 text-white'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{isAddingToCart ? 'Adding...' : 'Add'}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBuyNow}
            disabled={product.stock_quantity <= 0}
            className={`flex-1 rounded-lg py-2 font-semibold text-sm transition-colors ${
              product.stock_quantity <= 0
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            Buy Now
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductCard;
