import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { bagHandleOutline } from 'ionicons/icons';
import ProductsServiceClient from '../clients/ProductsService';
import OrderServiceClient from '../clients/OrdersService';
import '../assets/style/style.css';

const Shop = () => {
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        // Fetch best-selling product details from the /bestsellers endpoint
        const bestsellerResponse = await OrderServiceClient.get('/bestsellers?limit=3');
        const bestsellersData = bestsellerResponse.data;

        // Fetch product details including images for each bestseller
        const productPromises = bestsellersData.map(async (bestseller) => {
          const productResponse = await ProductsServiceClient.get(`/getbyid/${bestseller.product_id}`);
          const product = productResponse.data;

          try {
            const imageResponse = await ProductsServiceClient.get(`/download/bin/${product.id}`, {
              responseType: 'arraybuffer',
            });
            const base64Image = btoa(
              new Uint8Array(imageResponse.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
            );
            product.image = `data:image/png;base64,${base64Image}`;
          } catch (error) {
            product.image = null;
          }

          // Attach the order_count from the bestsellers API
          product.order_count = bestseller.order_count;

          return product;
        });

        const productsWithImages = await Promise.all(productPromises);
        setBestsellers(productsWithImages);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bestsellers:', err);
        setError('Unable to fetch bestsellers.');
        setLoading(false);
      }
    };

    fetchBestsellers();
  }, []);

  if (loading) {
    return <p>Loading bestsellers...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <section className="section shop" id="shop" aria-label="shop" data-section>
      <div className="container">
        <div className="title-wrapper">
          <h2 className="h2 section-title">Nasze Bestsellery</h2>
          <Link to="/products" className="btn-link">
            <span className="span">Zobacz wszystkie produkty</span>
            <ion-icon name="arrow-forward" aria-hidden="true"></ion-icon>
          </Link>
        </div>
        <ul className="has-scrollbar">
          {bestsellers.map((product) => (
            <li key={product.id} className="scrollbar-item">
              <Link to={`/product/${product.id}`}>
                <div className="shop-card">
                  <div
                    className="card-banner img-holder"
                    style={{ "--width": 540, "--height": 720 }}
                  >
                    <img
                      src={product.image || '/default-image.png'}
                      width="540"
                      height="720"
                      loading="lazy"
                      alt={product.name}
                      className="img-cover"
                    />
                    <span className="badge" aria-label="Bestseller">
                      Bestseller
                    </span>
                    <div className="card-actions">
                      <button className="action-btn" aria-label="add to cart">
                        <IonIcon icon={bagHandleOutline} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="price">
                      <span className="span">{product.price.toFixed(2)} zł</span>
                    </div>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="order-count">Sprzedano: {product.order_count} sztuk</p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Shop;
