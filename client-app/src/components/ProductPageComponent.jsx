import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../assets/style/style.css';
import ProductsServiceClient from '../clients/ProductsService';

const ProductPageComponent = () => {
  const { id } = useParams();
  const { addItemToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedGrind, setSelectedGrind] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [displayedPrice, setDisplayedPrice] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await ProductsServiceClient.get(`/getbyid/${id}`);
        const productData = response.data;

        const imageResponse = await ProductsServiceClient.get(`/download/bin/${id}`, {
          responseType: 'arraybuffer',
        });
        const base64Image = btoa(
          new Uint8Array(imageResponse.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        productData.image = base64Image;
        productData.file_extension = 'png';

        setProduct(productData);
        setDisplayedPrice(productData.price);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [id]);

  const handleGrindClick = (grind) => {
    setSelectedGrind(grind);
  };

  const handleWeightClick = (weight) => {
    setSelectedWeight(weight);

    if (weight === '500g') {
      setDisplayedPrice(product.price * 2);
    } else {
      setDisplayedPrice(product.price);
    }
  };

  const handleAddToCart = () => {
    if (selectedGrind && selectedWeight) {
      addItemToCart(product, selectedGrind, selectedWeight);
      toast.success(`Dodano ${product.name} do koszyka!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else {
      toast.error('Proszę wybrać stopień zmielenia i wagę.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="product-page">
      <ToastContainer /> {/* Add the ToastContainer here */}
      <div className="product-image">
        {product.image ? (
          <img src={`data:image/${product.file_extension};base64,${product.image}`} alt={product.name} />
        ) : (
          <div>No image available</div>
        )}
      </div>
      <div className="product-details">
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <p className="product-price">{displayedPrice.toFixed(2)} zł</p>
        <div className="product-options">
          <div className="option-group">
            <h2>Stopień zmielenia</h2>
            <button
              className={selectedGrind === 'Całe ziarna' ? 'selected' : ''}
              onClick={() => handleGrindClick('Całe ziarna')}
            >
              Całe ziarna
            </button>
            <button
              className={selectedGrind === 'Grubo mielone' ? 'selected' : ''}
              onClick={() => handleGrindClick('Grubo mielone')}
            >
              Grubo mielone
            </button>
            <button
              className={selectedGrind === 'Mocno zmielone' ? 'selected' : ''}
              onClick={() => handleGrindClick('Mocno zmielone')}
            >
              Mocno zmielone
            </button>
          </div>
          <div className="option-group">
            <h2>Waga</h2>
            <button
              className={selectedWeight === '250g' ? 'selected' : ''}
              onClick={() => handleWeightClick('250g')}
            >
              250g
            </button>
            <button
              className={selectedWeight === '500g' ? 'selected' : ''}
              onClick={() => handleWeightClick('500g')}
            >
              500g
            </button>
          </div>
        </div>
        <div className="product-actions">
          <button onClick={handleAddToCart}>Dodaj do koszyka</button>
        </div>
      </div>
    </div>
  );
};

export default ProductPageComponent;
