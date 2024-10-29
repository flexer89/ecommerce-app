import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import SortModal from '../components/SortModal';
import ProductsServiceClient from '../clients/ProductsService';
import Modal from '../components/ProductModal';
import FilterModal from '../components/FilterModal';
import OrderServiceClient from '../clients/OrdersService';
import '../assets/style/style.css';

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [bestsellers, setBestsellers] = useState([]); // Store bestsellers
  const [TotalMaxPrice, setTotalMaxPrice] = useState(0.0); // Added maxPrice state
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // For pagination
  const [totalPages, setTotalPages] = useState(0); // Total number of pages
  const [totalProducts, setTotalProducts] = useState(0); // Total number of products
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false); // State for modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [sortOptions, setSortOptions] = useState({ sortBy: '', sortOrder: 'asc' });

  const pageSize = 20; // Number of products per page

  const fetchBestsellers = async () => {
    try {
      // Fetch best-selling product details from the /bestsellers endpoint
      const bestsellerResponse = await OrderServiceClient.get('/bestsellers?limit=3');
      setBestsellers(bestsellerResponse.data);
    } catch (error) {
      console.error('Error fetching bestsellers:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);

    try {
      const offset = (currentPage - 1) * pageSize;

      // Build query parameters, ensuring undefined values are omitted
      const params = {
        limit: pageSize,
        offset: offset,
      };

      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.priceRange) {
        if (filters.priceRange[0] !== undefined) params.minPrice = filters.priceRange[0];
        if (filters.priceRange[1] !== undefined) params.maxPrice = filters.priceRange[1];
      }

      if (sortOptions.sortBy) {
        params.sort_by = sortOptions.sortBy;
        params.sort_order = sortOptions.sortOrder;
      }

      const queryParams = new URLSearchParams(params).toString();

      // Fetch the products with queryParams
      const response = await ProductsServiceClient.get(`/get?${queryParams}`);

      const { products: fetchedProducts, total, total_max_price: TotalMaxPrice } = response.data;

      setTotalProducts(total);
      setTotalPages(Math.ceil(total / pageSize));
      setTotalMaxPrice(parseFloat(TotalMaxPrice.toFixed(2)));

      if (fetchedProducts.length > 0) {
        const productIds = fetchedProducts.map((product) => product.id).join(',');

        const imagesResponse = await ProductsServiceClient.get('/download/images', {
          params: { product_ids: productIds },
        });
        const imagesData = imagesResponse.data;

        const productsWithImages = fetchedProducts.map((product) => {
          const base64Image = imagesData[product.id];
          product.image = base64Image ? `data:image/png;base64,${base64Image}` : null;

          // Check if the product is in the bestsellers list
          const isBestseller = bestsellers.some((bestseller) => bestseller.product_id === product.id);
          product.isBestseller = isBestseller;

          return product;
        });

        setProducts(productsWithImages);
      } else {
        setProducts([]);
      }

    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBestsellers(); // Fetch bestsellers first
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, filters, sortOptions, bestsellers]); // Re-fetch products when bestsellers are updated

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Modal handlers
  const openModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePageClick = (pageNumber) => {
    window.scrollTo(0, 0);
    setCurrentPage(pageNumber);
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="product-list-page container">
      <div className="product-list-header">
        <h1>Lista produktów</h1>
        <div className="product-list-controls">
          <button onClick={() => setIsFilterModalOpen(true)} className="our-mission-button">Otwórz Filtry</button>
          <button onClick={() => setIsSortModalOpen(true)} className="our-mission-button">Sortuj Produkty</button>
        </div>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <>
          {products.length === 0 ? (
            <div className='product-not-found-container'>
              <h1>Nie znaleziono produktów</h1>
              <p>Spróbuj dostosować filtry lub dodać nowy produkt.</p>
            </div>
          ) : (
            <>
              <div className="product-list">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isBestseller={product.isBestseller} // Pass the bestseller information
                    onClick={() => openModal(product)}
                  />
                ))}
              </div>
              <div className="pagination">
                <button onClick={handlePreviousPage} disabled={currentPage === 1}>Poprzednia</button>
                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageClick(pageNumber)}
                    className={pageNumber === currentPage ? 'active' : ''}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>Następna</button>
              </div>
            </>
          )}
        </>
      )}
      <Modal isOpen={isModalOpen} onClose={closeModal} product={selectedProduct} />
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onFilterChange={handleFilterChange}
        maxPrice={TotalMaxPrice}
      />
      <SortModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        onSortChange={(options) => {
          setSortOptions(options);
          setCurrentPage(1);
        }}
      />
    </div>
  );
};

export default ProductListPage;
