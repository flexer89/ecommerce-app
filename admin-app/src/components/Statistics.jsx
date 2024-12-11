import React, { useEffect, useState } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import { Link } from 'react-router-dom';
import ProductsServiceClient from '../clients/ProductsService';
import OrdersServiceClient from '../clients/OrdersService';
import UsersServiceClient from '../clients/UsersService';
import '../assets/style/style.css';

const ProductsStatistics = () => {
  const [productsCount, setProductsCount] = useState(0);
  const [bestsellers, setBestsellers] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [outOfStockAmount, setOutOfStockAmount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
      const fetchProductStats = async () => {
          try {
              const productsResponse = await ProductsServiceClient.get('/count');
              setProductsCount(productsResponse.data);

              const response = await ProductsServiceClient.get('/trends');
              setLowStockProducts(response.data.low_stock_products);
              setNewProducts(response.data.new_products);
              setDiscountedProducts(response.data.discounted_products);
              setOutOfStockAmount(response.data.out_of_stock_product_amount);
          } catch (error) {
              console.error('Error fetching product stats:', error);
          }
      };

      const fetchBestsellers = async () => {
          try {
              const bestsellerResponse = await OrdersServiceClient.get('/bestsellers?limit=5');
              const bestsellersData = bestsellerResponse.data;
              const ordersCountResponse = await OrdersServiceClient.get('/count');
              setOrdersCount(ordersCountResponse.data);

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
                  return { ...product, sales_count: bestseller.order_count };
              });

              const productsWithImages = await Promise.all(productPromises);
              setBestsellers(productsWithImages);
          } catch (error) {
              console.error('Error fetching bestsellers:', error);
          }
      };

      fetchProductStats();
      fetchBestsellers();
  }, []);

  return (
      <div className="section-container">
          <h2>Statystyki Produktów</h2>
          <div className='stat-container'>
              <div className='stat-card'>
                  <p>Liczba produktów: <span>{productsCount}</span></p>
              </div>
              <div className='stat-card'>
                  <p>Ilość wyczerpanych produktów: <span>{outOfStockAmount}</span></p>
              </div>
          </div>

          <div className="top-products-container">
              <h2>Bestsellery</h2>
              <div className="top-products-list">
                  {bestsellers.map((product) => (
                      <div className="top-product-item" key={product.id}>
                          <div className="product-details">
                              <img src={product.image || 'default-image.png'} alt={product.name} className="product-image" />
                              <div className="product-info">
                                  <h3 className="product-name">{product.name}</h3>
                                  <p className="product-price">{product.price.toFixed(2)} zł</p>
                              </div>
                          </div>
                          <div className="product-sales">
                              <div className="progress-bar">
                                  <div className="progress" style={{ width: `${(product.sales_count / ordersCount) * 100}%` }} />
                              </div>
                              <p>Sprzedaż: {product.sales_count}</p>
                              <p>Wartość sprzedaży: {(product.sales_count * product.price).toFixed(2)} zł</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          <div className="low-stock-container">
              <h2>Produkty o niskim stanie magazynowym</h2>
              <div className="low-stock-list">
                  {lowStockProducts.length > 0 ? (
                      lowStockProducts.map((product) => (
                          <div key={product.id} className="stat-card">
                              <div className="low-stock-info">
                                  <h3>{product.name}</h3>
                                  <p>Stan magazynowy: {product.stock}</p>
                              </div>
                          </div>
                      ))
                  ) : (
                      <p>Brak produktów o niskim stanie magazynowym</p>
                  )}
              </div>
          </div>
      </div>
  );
};

const OrdersStatistics = () => {
  const [ordersCount, setOrdersCount] = useState(0);
  const [averageProcessingTime, setAverageProcessingTime] = useState(0);
  const [ordersData, setOrdersData] = useState([]);
  const [orderStatusCounts, setOrderStatusCounts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [cancellationsCount, setCancellationsCount] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const statusMapping = {
    pending: 'Oczekujące',
    processing: 'Przetwarzane',
    shipped: 'Wysłane',
    delivered: 'Dostarczone',
    cancelled: 'Anulowane',
  };

  useEffect(() => {
    const fetchOrdersStats = async () => {
      try {
        const ordersResponse = await OrdersServiceClient.get('/count');
        const ordersTrendsResponse = await OrdersServiceClient.get('/trends');

        setOrdersCount(ordersResponse.data);
        setOrdersData(ordersTrendsResponse.data.monthly_trends);
        setAverageProcessingTime(Number(ordersTrendsResponse.data.avg_processing_time) || 0);
        setOrderStatusCounts(ordersTrendsResponse.data.order_status_counts);
        setCancellationsCount(ordersTrendsResponse.data.cancellations_count);
        setConversionRate(ordersTrendsResponse.data.conversion_rate || 0);

        // Fetch top customers based on orders trends data
        const topCustomersData = ordersTrendsResponse.data.top_customers;

        // Fetch customer details from user service for each top customer
        const customerPromises = topCustomersData.map(async (customer) => {
          const userResponse = await UsersServiceClient.get(`/get/${customer.user_id}`);
          const userData = userResponse.data.users[0];
          return {
            ...customer,
            name: `${userData.firstName} ${userData.lastName}`,
            email: `${userData.email}`
          };
        });

        const customers = await Promise.all(customerPromises);
        setTopCustomers(customers);

      } catch (error) {
        console.error('Error fetching orders statistics:', error);
      }
    };

    fetchOrdersStats();
  }, []);

  const orderAmountChartData = {
    labels: ordersData.map(order => order.month),
    datasets: [
      {
        label: 'Zamówienia na miesiąc',
        data: ordersData.map(order => order.total_orders),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        fill: true,
      },
    ],
  };

  const orderRevenueChartData = {
    labels: ordersData.map(order => order.month),
    datasets: [
      {
        label: 'Wartość zamówień na miesiąc',
        data: ordersData.map(order => order.total_revenue),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        ticks: {
          stepSize: 10,
        },
      },
    },
  };

  const orderStatusLabels = orderStatusCounts.map(statusData => statusMapping[statusData.status] || statusData.status);
  const orderStatusData = orderStatusCounts.map(statusData => statusData.order_count);

  const orderStatusChartData = {
    labels: orderStatusLabels,
    datasets: [
      {
        label: 'Statusy zamówień',
        data: orderStatusData,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)', // Oczekujące
          'rgba(54, 162, 235, 0.6)', // Przetwarzane
          'rgba(75, 192, 192, 0.6)', // Wysłane
          'rgba(255, 206, 86, 0.6)', // Dostarczone
          'rgba(153, 102, 255, 0.6)', // Anulowane
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="section-container">
      <h2>Statystyki zamówień</h2>
      <div className="low-stock-list">
        <div className="stat-card">
          <h3>Ilość zamówień: </h3>
          <p>{ordersCount}</p>
        </div>
        <div className="stat-card">
          <h3>Średni czas przetwarzania</h3>
          <p>{averageProcessingTime.toFixed(2)} godzin</p>
        </div>
        <div className="stat-card">
          <h3>Ilość anulacji</h3>
          <p>{cancellationsCount}</p>
        </div>
        <div className="stat-card">
          <h3>Wskaźnik konwersji</h3>
          <p>{(conversionRate * 100).toFixed(2)}%</p>
        </div>
      </div>
      <div className="chart">
          <h3>Trend zamówień</h3>
          <Line data={orderAmountChartData} options={chartOptions} height={"100%"}/>
          <h3>Trend przychodu</h3>
          <Line data={orderRevenueChartData} options={chartOptions} height={"100%"} />
        <h3>Statusy zamówień</h3>
        <div className='chart-container'>
          <Doughnut
            data={orderStatusChartData}
            options={{
              responsive: true,
            }}
          />
        </div>
      </div>

      <div className="top-customers-container">
        <h2>Najlepsi klienci</h2>
        <div className="top-customers-list">
          {topCustomers.map(customer => (
            <div key={customer.user_id} className="customer-card">
              <h4 className='product-name'>{customer.name}</h4>
              <div className="customer-info">
                <h5><Link to={`/users/${customer.user_id}`}>{customer.email}</Link></h5>
                <h5><Link to={`/users/${customer.user_id}`}>{customer.user_id}</Link></h5>
              </div>
              <p>Liczba zamówień: {customer.orders_count}</p>
              <p>Wartość zamówień: {customer.total_spent.toFixed(2)} zł</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


// Main Statistics Component
const Statistics = () => {
  return (
    <div className="statistics-page container">
      <ProductsStatistics />
      <OrdersStatistics />
    </div>
  );
};

export default Statistics;
