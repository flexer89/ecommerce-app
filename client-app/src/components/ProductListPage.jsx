// src/pages/ProductListPage.jsx
import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import FilterPanel from '../components/FilterPanel';
import '../assets/style/style.css'; // Ensure the path is correct

import image1 from '../assets/images/product-01.png';

const mockedProducts = [
  { id: 1, name: '111', price: '7.95', description: 'Blackcurrant • Lemongrass • Wine', image: image1 },
  { id: 2, name: '222', price: '8.95', description: 'Orange • Cocoa • Nutmeg', image: image1 },
  { id: 3, name: '333', price: '8.95', description: 'Orange • Cocoa • Nutmeg', image: image1 },
  { id: 4, name: '444', price: '8.95', description: 'Orange • Cocoa • Nutmeg', image: image1 },
  { id: 5, name: '555', price: '8.95', description: 'Orange • Cocoa • Nutmeg', image: image1 },
  { id: 6, name: '666', price: '8.95', description: 'Orange • Cocoa • Nutmeg', image: image1 },
  { id: 7, name: '777', price: '8.95', description: 'Orange • Cocoa • Nutmeg', image: image1 },
  { id: 8, name: '888', price: '8.95', description: 'Orange • Cocoa • Nutmeg', image: image1 },
  { id: 9, name: '999', price: '8.95', description: 'Orange • Cocoa • Nutmeg', image: image1 },
  // Add more mocked products here
];

const getMaxPrice = (products) => {
  return Math.max(...products.map(product => parseFloat(product.price)));
};

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [maxPrice, setMaxPrice] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Simulate API response with mocked data
        const data = mockedProducts;
        setProducts(data);
        setFilteredProducts(data);
        setMaxPrice(getMaxPrice(data));
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (filters) => {
    let filtered = products;

    if (filters.priceRange) {
      filtered = filtered.filter(product => {
        const productPrice = parseFloat(product.price);
        return productPrice >= filters.priceRange[0] && productPrice <= filters.priceRange[1];
      });
    }

    if (filters.category1) {
      // Apply category1 filter logic
    }

    if (filters.category2) {
      // Apply category2 filter logic
    }

    setFilteredProducts(filtered);
  };

  return (
    <div className="product-list-page container">
      {/* <FilterPanel onFilterChange={handleFilterChange} maxPrice={maxPrice} /> */}
      <div className='product-list-container'>
        <div className="product-list">
            {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
