import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import FilterPanel from '../components/FilterPanel';
import ProductsServiceClient from '../clients/ProductsService';
import Modal from '../components/ProductModal';
import ProductCreateModal from '../components/ProductCreateModal';
import ProductEditModal from '../components/ProductEditModal';
import '../assets/style/style.css';

const ProductsPageComponent = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [maxPrice, setMaxPrice] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const handleCreateProduct = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = (productData) => {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price);
    formData.append('stock', productData.stock);
    formData.append('category', productData.category);
    formData.append('image', productData.image);

    ProductsServiceClient.post('/create', formData, {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(() => fetchProducts())
    .catch((error) => console.error('Error creating product:', error))
    .finally(() => setIsCreateModalOpen(false));
  };

  const handleEditProduct = (productId) => {
    const productToEdit = products.find((product) => product.id === productId);
    setSelectedProduct(productToEdit);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (productData, productId) => {
    const updatedProductData = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stock: productData.stock,
      category: productData.category,
      discount: productData.discount,
    };

    ProductsServiceClient.put(`/update/${productId}`, updatedProductData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(() => fetchProducts())
    .catch((error) => console.error('Error updating product:', error))
    .finally(() => setIsEditModalOpen(false));
  };

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
    setFilteredProducts(filtered);
  };

  return (
    <div className="product-list-page container">
      <FilterPanel onFilterChange={handleFilterChange} maxPrice={maxPrice} />
      <div className="product-list-container">
        <div className="product-list-header">
          <h1>Lista produktów</h1>
          <button onClick={handleCreateProduct} className="our-mission-button">Dodaj produkt</button>
        </div>
        <div className="product-list">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onClick={() => openModal(product)} onEdit={handleEditProduct} />
          ))}
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} product={selectedProduct} />
      <ProductCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />
      <ProductEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        product={selectedProduct}
      />
    </div>
  );
};

export default ProductsPageComponent;
