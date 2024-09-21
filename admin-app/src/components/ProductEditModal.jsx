import React, { useState, useEffect } from 'react';
import ProductsServiceClient from '../clients/ProductsService';

const ProductEditModal = ({ isOpen, onClose, onSubmit, product }) => {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price ? product.price.toFixed(2) : '');
  const [category, setCategory] = useState(product?.category || '');
  const [stock, setStock] = useState(product?.stock || '');
  const [discount, setDiscount] = useState(product?.discount || 0);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.image || '');

  useEffect(() => {
    setName(product?.name || '');
    setDescription(product?.description || '');
    setPrice(product?.price ? product.price.toFixed(2) : '');
    setCategory(product?.category || '');
    setStock(product?.stock || '');
    setDiscount(product?.discount || 0);
    setImagePreview(product?.image || '');
  }, [product]);

  const handleSubmit = async () => {
    const productData = {
      name,
      description,
      price,
      category,
      stock,
      discount
    };

    onSubmit(productData, product.id);

    if (image) {
      const formData = new FormData();
      formData.append('image', image);

      try {
        await ProductsServiceClient.put(`/update/${product.id}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('Image updated successfully!');
      } catch (error) {
        console.error('Error updating product image:', error);
      }
      window.location.reload();
    }
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
          <h2>Edytuj produkt</h2>
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

          <label>Zniżka</label>
          <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="Zniżka" />

          <label>Obraz</label>
          <div className="images-upload">
            {imagePreview && <img src={imagePreview} alt="product" className="image-preview" />}
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="our-mission-button" onClick={handleSubmit}>
            Zapisz zmiany
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default ProductEditModal;
