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
        const finalPrice = productData.discount > 0
          ? productData.price * (1 - productData.discount)
          : productData.price;
        setDisplayedPrice(finalPrice);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [id]);


  const handleWeightClick = (weight) => {
    setSelectedWeight(weight);

    const basePrice = product.discount > 0
      ? product.price * (1 - product.discount)
      : product.price;

    setDisplayedPrice(weight === 500 ? basePrice * 2 : basePrice);
  };

  const handleAddToCart = async () => {
    if (product.stock <= 0) {
      toast.error('Ten produkt jest niedostępny.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    if (selectedWeight) {
      try {
        const updateQuantityPayload = {
          items: [
            {
              product_id: product.id,
              quantity: selectedWeight === 500 ? 2 : 1
            }
          ]
        };

        const response = await ProductsServiceClient.post(`/update-quantity`, updateQuantityPayload);

        if (response.status === 200) {
          addItemToCart(product, selectedWeight);
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
          toast.error('Nie można dodać produktu do koszyka. Sprawdź dostępność.', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      } catch (error) {
        console.error('Error updating product quantity:', error);
        toast.error('Wystąpił błąd podczas dodawania do koszyka.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } else {
      toast.error('Proszę wybrać wagę.', {
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
      <ToastContainer />
      <div className="product-image" style={{ position: 'relative' }}>
        {product.discount > 0 && (
          <div className="discount-badge">-{product.discount * 100}%</div>
        )}
        {product.image ? (
          <img src={`data:image/${product.file_extension};base64,${product.image}`} alt={product.name} />
        ) : (
          <div>No image available</div>
        )}
        {product.stock <= 0 && (
          <div className="out-of-stock-banner">
            Produkt niedostępny
          </div>
        )}
      </div>
      <div className="product-details">
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        {product.discount > 0 ? (
          <div className="product-price">
            <span className="old-price">{product.price.toFixed(2)} zł</span>
            <span className="new-price">{displayedPrice.toFixed(2)} zł</span>
          </div>
        ) : (
          <p className="product-price">{displayedPrice.toFixed(2)} zł</p>
        )}

        <div className="product-options">
          <div className="option-group">
            <h2>Waga</h2>
            <button
              className={selectedWeight === 250 ? 'selected' : ''}
              onClick={() => handleWeightClick(250)}
              disabled={product.stock <= 0}
            >
              250g
            </button>
            <button
              className={selectedWeight === 500 ? 'selected' : ''}
              onClick={() => handleWeightClick(500)}
              disabled={product.stock <= 0}
            >
              500g
            </button>
          </div>
        </div>
        <div className="product-actions">
          <button onClick={handleAddToCart} disabled={product.stock <= 0}>
            {product.stock <= 0 ? 'Niedostępny' : 'Dodaj do koszyka'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPageComponent;
