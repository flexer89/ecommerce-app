import React, { useEffect, useState } from 'react';
import OrderServiceClient from '../clients/OrdersService';
import ProductsServiceClient from '../clients/ProductsService';
import ShipmentServiceClient from '../clients/ShipmentsService'; 
import { orderStatusTranslationMap, shipmentStatuses } from '../utils/utils';
import '../assets/style/style.css';


const OrderDetailModal = ({ order, onClose }) => {
  const [orderItems, setOrderItems] = useState([]);
  const [productNames, setProductNames] = useState({});
  const [shipment, setShipment] = useState(null);
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await OrderServiceClient.get(`/get/${order.id}`);
        const items = response.data.items;

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

    const fetchShipment = async () => {
      try {
        // Assuming there's an API to get shipment details by order ID
        const shipmentResponse = await ShipmentServiceClient.get(`/getbyorder/${order.id}`);
        if (shipmentResponse.data) {
          setShipment(shipmentResponse.data); // Store shipment details
        }
      } catch (error) {
        console.error('No shipment found for this order:', error);
        setShipment(null); // Ensure shipment is null if no shipment exists
      }
    };

    if (order) {
      fetchOrderDetails();
      fetchShipment(); // Fetch shipment details if the order has a shipment
    }
  }, [order]);

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-order-content">
        <div className="modal-header">
          <h2>Szczegóły zamówienia - Zamówienie #{order.id}</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <div className="modal-body">
          <p><strong>ID użytkownika:</strong> {order.user_id}</p>
          <p><strong>Status:</strong> {orderStatusTranslationMap[order.status]}</p>
          <p><strong>Cena łączna:</strong> {order.total_price.toFixed(2)} zł</p>
          <p><strong>Data zamówienia:</strong> {new Date(order.created_at).toLocaleDateString()}</p>

          <h3>Zamówione produkty</h3>
          {orderItems.length > 0 ? (
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Produkt</th>
                  <th>Waga</th>
                  <th>Ilość</th>
                  <th>Cena za jednostkę</th>
                  <th>Cena całkowita</th>
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
            <p>Nie znaleziono elementów dla tego zamówienia.</p>
          )}
          {shipment ? (
            <div className="shipment-details">
              <h3>Informacje o wysyłce</h3>
              <p><strong>ID wysyłki:</strong> {shipment.id}</p>
              <p><strong>Adres zamówienia:</strong> {shipment.shipment_address}</p>
              <p><strong>Data wysłania:</strong> {new Date(shipment.shipment_date).toLocaleDateString()}</p>
              <p><strong>Data dostawy:</strong> {new Date(shipment.delivery_date).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {shipmentStatuses[shipment.status]}</p>
              <p><strong>Przewoźnik:</strong> {shipment.company}</p>
            </div>
          ) : (
            <p>Nie znaleziono szczegółów wysyłki dla tego zamówienia.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
