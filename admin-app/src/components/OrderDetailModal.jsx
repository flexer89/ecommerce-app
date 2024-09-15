import React, { useEffect, useState } from 'react';
import OrderServiceClient from '../clients/OrdersService';
import ProductsServiceClient from '../clients/ProductsService';
import '../assets/style/style.css';

const OrderDetailModal = ({ order, onClose }) => {
  const [orderItems, setOrderItems] = useState([]);
  const [productNames, setProductNames] = useState({});

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await OrderServiceClient.get(`/get/${order.id}`);
        const items = response.data.items;

        // Fetch product names for each item in the order
        const productNamesPromises = items.map(async (item) => {
          try {
            const productResponse = await ProductsServiceClient.get(`/getbyid/${item.product_id}`);
            const product = productResponse.data;
            return { productId: item.product_id, productName: product.name };
          } catch (error) {
            console.error(`Error fetching product ${item.product_id}:`, error);
            return { productId: item.product_id, productName: 'Unknown Product' };
          }
        });

        const names = await Promise.all(productNamesPromises);
        const namesMap = {};
        names.forEach(({ productId, productName }) => {
          namesMap[productId] = productName;
        });

        setOrderItems(items);
        setProductNames(namesMap);
      } catch (error) {
        console.error('Error fetching order items:', error);
        setOrderItems([]); // Ensure the state is always an array
      }
    };

    if (order) {
      fetchOrderDetails();
    }
  }, [order]);

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-order-content">
        <div className="modal-header">
          <h2>Order Details - Order #{order.id}</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <div className="modal-body">
          <p><strong>User ID:</strong> {order.user_id}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Total Price:</strong> {order.total_price.toFixed(2)} zł</p>
          <p><strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>

          <h3>Zamówione produkty</h3>
          {orderItems.length > 0 ? (
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Produkt</th>
                  <th>Waga opakowania</th>
                  <th>Ilość</th>
                  <th>Cena jednostkowa</th>
                  <th>Łączna cena</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item) => (
                  <tr key={item.id}>
                    <td>{productNames[item.product_id] || 'Loading...'}</td>
                    <td>{item.weight}g</td>
                    <td>{item.quantity}</td>
                    <td>{item.price.toFixed(2)} zł</td>
                    <td>{(item.price * item.quantity).toFixed(2)} zł</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No items found for this order.</p>
          )}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="our-mission-button">Close</button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
