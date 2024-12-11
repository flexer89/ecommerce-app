import React, { useState } from 'react';

const SortModal = ({ isOpen, onClose, onSortChange }) => {
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSortChange = () => {
    onSortChange({ sortBy, sortOrder });
    onClose();
  };

  return isOpen ? (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Sortuj Produkty</h2>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <div className="sort-options">
            <div className='sort-option'>
                <label>Sortuj według:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="">Wybierz...</option>
                    <option value="price">Cena</option>
                    <option value="name">Nazwa</option>
                    <option value="discount">Zniżka</option>
                </select>
            </div>
            <div className='sort-option'>
                <label>Kolejność:</label>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="asc">Rosnąco</option>
                    <option value="desc">Malejąco</option>
                </select>
            </div>
        </div>
        <div className="modal-footer">
          <button className="our-mission-button" onClick={handleSortChange}>
            Zastosuj
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default SortModal;
