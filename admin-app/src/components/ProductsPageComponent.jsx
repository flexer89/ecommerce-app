import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import SortModal from '../components/SortModal';
import ProductsServiceClient from '../clients/ProductsService';
import Modal from '../components/ProductModal';
import ProductCreateModal from '../components/ProductCreateModal';
import ProductEditModal from '../components/ProductEditModal';
import FilterModal from '../components/FilterModal';
import '../assets/style/style.css';

const ProductsPageComponent = () => {
  const [products, setProducts] = useState([]);
  const [TotalMaxPrice, setTotalMaxPrice] = useState(0); // Added maxPrice state
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // For pagination
  const [totalPages, setTotalPages] = useState(0); // Total number of pages
  const [totalProducts, setTotalProducts] = useState(0); // Total number of products
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false); // State for modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [sortOptions, setSortOptions] = useState({ sortBy: '', sortOrder: 'asc' });


  const pageSize = 20; // Number of products per page

const fetchProducts = async () => {
  setLoading(true);

  try {
    const offset = (currentPage - 1) * pageSize;

    // Build query parameters, ensuring undefined values are omitted
    const params = {
      limit: pageSize,
      offset: offset,
    };

    // Only include filters in params if they have a value
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.priceRange) {
      if (filters.priceRange[0] !== undefined) params.minPrice = filters.priceRange[0];
      if (filters.priceRange[1] !== undefined) params.maxPrice = filters.priceRange[1];
    }

    // Include sorting options
    if (sortOptions.sortBy) {
      params.sort_by = sortOptions.sortBy;
      params.sort_order = sortOptions.sortOrder;
    }
    // Debugging: Print params to check their values before making the API call
    console.log('Query Params:', params);

    // Build URL with query parameters
    const queryParams = new URLSearchParams(params).toString();

    console.log('Final Query String:', queryParams); // Debugging

    // Fetch the products with queryParams
    const response = await ProductsServiceClient.get(`/get?${queryParams}`);

    // Assuming response.data is { products: [...], total: number }
    const { products: fetchedProducts, total, total_max_price: TotalMaxPrice } = response.data;

    // Set products and pagination values
    setTotalProducts(total);
    setTotalPages(Math.ceil(total / pageSize));
    setTotalMaxPrice(TotalMaxPrice); // Set maxPrice state

    if (fetchedProducts.length > 0) {
    // Fetch images for the products
    const productIds = fetchedProducts.map((product) => product.id).join(',');

    const imagesResponse = await ProductsServiceClient.get('/download/images', {
      params: { product_ids: productIds },
    });
    const imagesData = imagesResponse.data;

    // Map images to products
    const productsWithImages = fetchedProducts.map((product) => {
      const base64Image = imagesData[product.id];
      product.image = base64Image ? `data:image/png;base64,${base64Image}` : null;
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
    fetchProducts();
  }, [currentPage, filters, sortOptions]);

  const handleFilterChange = (newFilters) => {
    console.log('Received Filters in Parent:', newFilters); // Debugging
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
        accept: 'application/json',
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

  // Pagination controls
  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePageClick = (pageNumber) => {
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
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="our-mission-button"
        >
          Otwórz Filtry
        </button>
        <button onClick={handleCreateProduct} className="our-mission-button">
          Dodaj Produkt
        </button>
        <button onClick={() => setIsSortModalOpen(true)} className="our-mission-button">
          Sortuj Produkty
        </button>
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
                    onClick={() => openModal(product)}
                    onEdit={handleEditProduct}
                  />
                ))}
              </div>
              <div className="pagination">
                <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                  Poprzednia
                </button>
                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageClick(pageNumber)}
                    className={pageNumber === currentPage ? 'active' : ''}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Następna
                </button>
              </div>
            </>
          )}
        </>
      )}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        product={selectedProduct}
      />
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

export default ProductsPageComponent;
