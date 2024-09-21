import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const FilterPanel = ({ onFilterChange, maxPrice }) => {
  // Ensure maxPrice is a valid number
  const validMaxPrice = Number.isFinite(maxPrice) ? maxPrice : 0;

  // Initialize local state for filters
  const [localPriceRange, setLocalPriceRange] = useState([0, validMaxPrice]);
  const [localSearchText, setLocalSearchText] = useState('');
  const [localCategory1, setLocalCategory1] = useState(false);
  const [localCategory2, setLocalCategory2] = useState(false);

  // Update local price range when maxPrice changes
  useEffect(() => {
    setLocalPriceRange([0, validMaxPrice]);
  }, [validMaxPrice]);

  // Handler for "Apply Filters" button
  const handleApplyFilters = () => {
    const appliedFilters = {
      priceRange: localPriceRange,
      search: localSearchText,
      arabica: localCategory1,
      robusta: localCategory2,
    };
    console.log('Applied filters:', appliedFilters);
    onFilterChange(appliedFilters);
  };

  // Handlers for input changes (update local state only)
  const handlePriceChange = (e) => {
    const value = Number(e.target.value);
    setLocalPriceRange([localPriceRange[0], value]);
  };

  const handleSearchChange = (e) => {
    setLocalSearchText(e.target.value);
  };

  const handleCategory1Change = (e) => {
    setLocalCategory1(e.target.checked);
  };

  const handleCategory2Change = (e) => {
    setLocalCategory2(e.target.checked);
  };

  return (
    <div className="filter-panel">
      <div className="filter-item">
        <input
          type="text"
          value={localSearchText}
          onChange={handleSearchChange}
          placeholder="Wyszukaj"
        />
      </div>
      {/* Price Range Slider */}
      <div className="filter-item">
        <label>Zakres cen:</label>
        <input
          type="range"
          min="0"
          max={validMaxPrice}
          value={localPriceRange[1]}
          onChange={handlePriceChange}
        />
        <span>
          {localPriceRange[0].toFixed(2)} zł - {localPriceRange[1].toFixed(2)} zł
        </span>
      </div>
      {/* Category Filters */}
      <div className="filter-item">
        <label>Kategoria</label>
        <div className="category-filter">
          <input
            type="checkbox"
            checked={localCategory1}
            onChange={handleCategory1Change}
          />
          Arabica
          <input
            type="checkbox"
            checked={localCategory2}
            onChange={handleCategory2Change}
          />
          Robusta
        </div>
      </div>
      {/* Apply Filters Button */}
      <div className="filter-item">
        <button className='our-mission-button' onClick={handleApplyFilters}>Zastosuj filtry</button>
      </div>
    </div>
  );
};

FilterPanel.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  maxPrice: PropTypes.number,
};

FilterPanel.defaultProps = {
  maxPrice: 0,
};

export default FilterPanel;
