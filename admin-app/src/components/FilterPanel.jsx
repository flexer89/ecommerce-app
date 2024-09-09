import React, { useState, useEffect } from 'react';
import { Slider } from '@mui/material';
import '../assets/style/style.css';

const FilterPanel = ({ onFilterChange, maxPrice }) => {
  const [priceRange, setPriceRange] = useState([0, maxPrice]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  const handlePriceChange = (event, newPriceRange) => {
    setPriceRange(newPriceRange);
    onFilterChange('priceRange', newPriceRange);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    onFilterChange('search', value);
  };

  return (
    <div className="filter-panel">
      {/* Search Bar */}
      <div className="filter-section">
        <input
          type="text"
          placeholder="Wyszukaj produkt..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      {/* Price Range Filter */}
      <div className="filter-section">
        <p variant="subtitle1">Cena</p>
        <Slider
          value={priceRange}
          onChange={handlePriceChange}
          valueLabelDisplay="auto"
          min={0}
          max={maxPrice}
          step={0.01}
          color=" "
        />
        <p>{priceRange[0].toFixed(2)} - {priceRange[1].toFixed(2)}</p>
      </div>

      {/* Category Filters */}
      <div className="filter-section">
        <label>
          <input type="checkbox" name="category1" onChange={(e) => onFilterChange(e.target.name, e.target.checked)} />
          Category 1
        </label>
        <label>
          <input type="checkbox" name="category2" onChange={(e) => onFilterChange(e.target.name, e.target.checked)} />
          Category 2
        </label>
      </div>
    </div>
  );
};

export default FilterPanel;
