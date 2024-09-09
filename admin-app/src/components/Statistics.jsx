import React, { useEffect, useState } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import ProductsServiceClient from '../clients/ProductsService';
import OrdersServiceClient from '../clients/OrdersService';
import ShipmentsServiceClient from '../clients/ShipmentsService';
import UsersServiceClient from '../clients/UsersService';
import PaymentsServiceClient from '../clients/PaymentsService';
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

    const lowStockChartData = {
        labels: lowStockProducts.map((product) => product.name),
        datasets: [
            {
                label: 'Stan magazynowy',
                data: lowStockProducts.map((product) => product.stock),
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
        ],
    };

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

            {/* Top Selling Products */}
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

            {/* Chart for Low Stock Products */}
            <div className="chart-container">
                <h2>Produkty o niskim stanie magazynowym</h2>
                <Line data={lowStockChartData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
            </div>

            {/* New Products (DataTable.net integration can go here) */}
            {/* Discounted Products (DataTable.net integration can go here) */}
        </div>
    );
};


const OrdersStatistics = () => {
  const [ordersCount, setOrdersCount] = useState(0);
  const [averageProcessingTime, setAverageProcessingTime] = useState(0);
  const [ordersData, setOrdersData] = useState([]);
  const [orderStatusCounts, setOrderStatusCounts] = useState([]);

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
        setAverageProcessingTime(ordersTrendsResponse.data.avg_processing_time);
        setOrderStatusCounts(ordersTrendsResponse.data.order_status_counts);
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
        max: undefined,
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
      <p>Ilość zamówień: {ordersCount}</p>
      <p>Średni czas przetwarzania: {averageProcessingTime.toFixed(2)} godzin</p>

      <div className="order-status-container">
        <h3>Statusy zamówień</h3>
        <Doughnut
          data={orderStatusChartData}
          options={{
            responsive: true,
          }}
        />
      </div>

      <div className="chart">
        <div className='chart-container'>
          <h3>Trend zamówień</h3>
          <Line data={orderAmountChartData} options={chartOptions} />
        </div>
        <div className='chart-container'>
          <h3>Trend przychodu</h3>
          <Line data={orderRevenueChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};



// // Shipments Statistics Section
// const ShipmentsStatistics = () => {
//   const [shipmentsCount, setShipmentsCount] = useState(0);
//   const [mostShippedProducts, setMostShippedProducts] = useState([]);

//   useEffect(() => {
//     const fetchShipmentsStats = async () => {
//       const shipmentsResponse = await ShipmentsServiceClient.get('/count');
//       const shippedProductsResponse = await ShipmentsServiceClient.get('/most-shipped-products');
//       setShipmentsCount(shipmentsResponse.data.total);
//       setMostShippedProducts(shippedProductsResponse.data);
//     };

//     fetchShipmentsStats();
//   }, []);

//   return (
//     <div className="section-container">
//       <h2>Shipments Statistics</h2>
//       <p>Total Shipments: {shipmentsCount}</p>
//       <h3>Most Shipped Products</h3>
//       <ul>
//         {mostShippedProducts.map((product) => (
//           <li key={product.id}>{product.name} - {product.shipped} shipped</li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// // Users Statistics Section
// const UsersStatistics = () => {
//   const [usersCount, setUsersCount] = useState(0);
//   const [userGrowth, setUserGrowth] = useState([]);

//   useEffect(() => {
//     const fetchUsersStats = async () => {
//       const usersResponse = await UsersServiceClient.get('/count');
//       const userGrowthResponse = await UsersServiceClient.get('/growth');
//       setUsersCount(usersResponse.data.total);
//       setUserGrowth(userGrowthResponse.data);
//     };

//     fetchUsersStats();
//   }, []);

//   const userGrowthChartData = {
//     labels: userGrowth.map(user => user.month),
//     datasets: [
//       {
//         label: 'User Growth',
//         data: userGrowth.map(user => user.count),
//         backgroundColor: 'rgba(255, 99, 132, 0.6)',
//         borderColor: 'rgba(255, 99, 132, 1)',
//         borderWidth: 1,
//       },
//     ],
//   };

//   return (
//     <div className="section-container">
//       <h2>Users Statistics</h2>
//       <p>Total Users: {usersCount}</p>
//       <div className="chart">
//         <h3>User Growth</h3>
//         <Line data={userGrowthChartData} />
//       </div>
//     </div>
//   );
// };

// // Payments Statistics Section
// const PaymentsStatistics = () => {
//   const [paymentsCount, setPaymentsCount] = useState(0);
//   const [revenueData, setRevenueData] = useState([]);

//   useEffect(() => {
//     const fetchPaymentsStats = async () => {
//       const paymentsResponse = await PaymentsServiceClient.get('/count');
//       const revenueTrendsResponse = await PaymentsServiceClient.get('/revenue-trends');
//       setPaymentsCount(paymentsResponse.data.total);
//       setRevenueData(revenueTrendsResponse.data);
//     };

//     fetchPaymentsStats();
//   }, []);

//   const revenueChartData = {
//     labels: revenueData.map(revenue => revenue.month),
//     datasets: [
//       {
//         label: 'Revenue per Month',
//         data: revenueData.map(revenue => revenue.amount),
//         backgroundColor: 'rgba(75, 192, 192, 0.6)',
//         borderColor: 'rgba(75, 192, 192, 1)',
//         borderWidth: 1,
//       },
//     ],
//   };

//   return (
//     <div className="section-container">
//       <h2>Payments Statistics</h2>
//       <p>Total Payments: {paymentsCount}</p>
//       <div className="chart">
//         <h3>Revenue Trend</h3>
//         <Bar data={revenueChartData} />
//       </div>
//     </div>
//   );
// };

// Main Statistics Component
const Statistics = () => {
  return (
    <div className="statistics-page container">
      <ProductsStatistics />
      <OrdersStatistics />
      {/* <ShipmentsStatistics />
      <UsersStatistics />
      <PaymentsStatistics /> */}
    </div>
  );
};

export default Statistics;
