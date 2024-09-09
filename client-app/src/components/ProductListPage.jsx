import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import FilterPanel from '../components/FilterPanel';
import ProductsServiceClient from '../clients/ProductsService';
import Modal from '../components/ProductModal';
import '../assets/style/style.css';

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [maxPrice, setMaxPrice] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const limit = 10;

  const fetchProducts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const response = await ProductsServiceClient.get(`/get/${limit}/${offset}`);
      const newProducts = response.data;

      if (newProducts.length < limit) {
        setHasMore(false);
      }

      const productsWithImages = await Promise.all(newProducts.map(async (product) => {
        try {
          const imageResponse = await ProductsServiceClient.get(`/download/bin/${product.id}`, {
            responseType: 'arraybuffer',
          });
          const base64Image = btoa(
            new Uint8Array(imageResponse.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          product.image = `data:image/png;base64,${base64Image}`;
        } catch (error) {
          product.image = null;
        }
        return product;
      }));

      setProducts((prevProducts) => [...prevProducts, ...productsWithImages]);
      setFilteredProducts((prevProducts) => [...prevProducts, ...productsWithImages]);

      setOffset((prevOffset) => prevOffset + limit);

    } catch (error) {
      console.error('Error fetching products:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Handle scrolling for lazy loading
  const handleScroll = () => {
    const scrollTop = document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    const scrollPercentage = (scrollTop + windowHeight) / documentHeight;

    if (scrollPercentage > 0.7) {
      fetchProducts();
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [offset, loading, hasMore]);

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (filters) => {
    let filtered = products;

    if (filters.search) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.priceRange) {
      filtered = filtered.filter((product) => {
        const productPrice = parseFloat(product.price.toFixed(2));
        return productPrice >= filters.priceRange[0] && productPrice <= filters.priceRange[1];
      });
    }

    if (filters.category1) {
      filtered = filtered.filter((product) => product.category.toLowerCase() === 'arabica');
    }

    if (filters.category2) {
      filtered = filtered.filter((product) => product.category.toLowerCase() === 'robusta');
    }

    if (filters.category2 && filters.category1) {
      filtered = products;
    }

    setFilteredProducts(filtered);
  };

  return (
    <div className="product-list-page container">
      <FilterPanel onFilterChange={handleFilterChange} maxPrice={maxPrice} />
      <div className="product-list-container">
        <div className="product-list">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onClick={() => openModal(product)} />
          ))}
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} product={selectedProduct} />
    </div>
  );
};

export default ProductListPage;
