import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import ProductServiceClient from '../clients/ProductsService';

const FilterModal = ({ onFilterChange, maxPrice = 0, isOpen, onClose }) => {
  const validMaxPrice = Number.isFinite(maxPrice) ? maxPrice : 0;

  const [localPriceRange, setLocalPriceRange] = useState([0, validMaxPrice]);
  const [localSearchText, setLocalSearchText] = useState('');
  const [localCategory, setLocalCategory] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);

  useEffect(() => {
    setLocalPriceRange([0, validMaxPrice]);
    fetchCategories();
  }, [validMaxPrice]);

  const handleApplyFilters = () => {
    const appliedFilters = {
      priceRange: localPriceRange,
      search: localSearchText,
      category: localCategory,
    };
    onFilterChange(appliedFilters);
    onClose(); // Close modal after applying filters
  };

  const handlePriceChange = (e) => {
    let value = Number(e.target.value);
    value = Number(value.toFixed(2));
    setLocalPriceRange([localPriceRange[0], value]);
  };

  const handleSearchChange = (e) => {
    setLocalSearchText(e.target.value);
  };

  const handleCategory = (e) => {
    setLocalCategory(e.target.value);
  };

  const fetchCategories = async () => {
    try {
      let categories = await ProductServiceClient.get('/categories');
      categories = categories.data;
      setAvailableCategories(Array.isArray(categories) ? categories : []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setAvailableCategories([]); // Fallback to an empty array on error
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="filter-panel">
        <div className="filter-item">
          <input
            type="text"
            value={localSearchText}
            onChange={handleSearchChange}
            placeholder="Wyszukaj"
          />
        </div>
        <div className="filter-item">
          <label>Zakres cen:</label>
          <input
            type="range"
            min="0"
            max={validMaxPrice}
            value={localPriceRange[1]}
            onChange={handlePriceChange}
            step={0.01}
          />
          <span>
            {localPriceRange[0].toFixed(2)} zł - {localPriceRange[1].toFixed(2)} zł
          </span>
        </div>
        <div className="filter-item">
          <label>Kategoria</label>
          <div className="category-filter">
            <select value={localCategory} onChange={handleCategory}>
              <option value="">Wszystkie</option>
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="filter-item">
          <button className="our-mission-button" onClick={handleApplyFilters}>
            Zastosuj filtry
          </button>
        </div>
      </div>
    </Modal>
  );
};

FilterModal.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  maxPrice: PropTypes.number,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FilterModal;
