import React, { useState } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import ProductList from '../components/features/admin/products/ProductList';
import AddProduct from '../components/features/admin/products/AddProduct';
import CategoriesTab from '../components/features/admin/products/CategoriesTab';
import BrandsTab from '../components/features/admin/products/BrandsTab';

const ProductManagement = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [activeProductsTab, setActiveProductsTab] = useState('list');

  return (
    <AdminLayout>
      <div className="px-2 sm:px-4 md:px-0">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8">Product Management</h1>
        <div className="flex border-b border-blue-200 overflow-x-auto">
          <button
            className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-lg font-medium whitespace-nowrap ${activeTab === 'products' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button
            className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-lg font-medium whitespace-nowrap ${activeTab === 'categories' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
          <button
            className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-lg font-medium whitespace-nowrap ${activeTab === 'brands' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('brands')}
          >
            Brands
          </button>
        </div>
        <div className="py-4 sm:py-6 md:py-8">
          {activeTab === 'products' && (
            <div>
              <div className="flex border-b border-blue-200 overflow-x-auto">
                <button
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap ${activeProductsTab === 'list' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
                  onClick={() => setActiveProductsTab('list')}
                >
                  Product List
                </button>
                <button
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap ${activeProductsTab === 'add' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
                  onClick={() => setActiveProductsTab('add')}
                >
                  Add Product
                </button>
              </div>
              <div className="py-2 sm:py-3 md:py-4">
                {activeProductsTab === 'list' && <ProductList />}
                {activeProductsTab === 'add' && <AddProduct />}
              </div>
            </div>
          )}
          {activeTab === 'categories' && <CategoriesTab />}
          {activeTab === 'brands' && <BrandsTab />}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProductManagement;
