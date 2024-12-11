import React, { useState } from 'react';

const ProductCreateModal = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const handleSubmit = () => {
    const productData = {
      name,
      description,
      price,
      category,
      stock,
      image,
    };

    onSubmit(productData);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return isOpen ? (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Dodaj produkt</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <label>Nazwa produktu</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nazwa" />

          <label>Opis</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opis"></textarea>

          <label>Cena</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Cena" />

          <label>Kategoria</label>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Kategoria" />

          <label>Stan magazynowy</label>
          <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Stan magazynowy" />

          <label>Obrazy</label>
          <div className="images-upload">
            {imagePreview && <img src={imagePreview} alt="produkt" className="image-preview" />}
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="our-mission-button" onClick={handleSubmit}>
            Dodaj produkt
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default ProductCreateModal;
