// src/components/FilterPanel.jsx
import React, { useState, useEffect } from 'react';
import { Slider } from '@mui/material';
import '../assets/style/style.css'; // Ensure the path is correct

const FilterPanel = ({ onFilterChange, maxPrice }) => {
  const [priceRange, setPriceRange] = useState([0, maxPrice]);

  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  const handlePriceChange = (event, newPriceRange) => {
    setPriceRange(newPriceRange);
    onFilterChange('priceRange', newPriceRange);
  };

  return (
    <div className="filter-panel">
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
      {/* Add more filters as needed */}
    </div>
  );
};

export default FilterPanel;
