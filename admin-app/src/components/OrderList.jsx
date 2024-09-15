import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import OrderServiceClient from '../clients/OrdersService';
import UserServiceClient from '../clients/UsersService';
import OrderDetailModal from './OrderDetailModal';
import OrderEditModal from './OrderEditModal';
import '../assets/style/style.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const orderStatuses = [
  { label: 'All', key: 'all' },
  { label: 'Pending', key: 'pending' },
  { label: 'Processing', key: 'processing' },
  { label: 'Shipped', key: 'shipped' },
  { label: 'Delivered', key: 'delivered' },
  { label: 'Cancelled', key: 'cancelled' },
  { label: 'On Hold', key: 'on_hold' },
];

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // Default to 'All' orders
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });

  // Added state variables for search functionality
  const [searchText, setSearchText] = useState(''); // Input value for search
  const [searchQuery, setSearchQuery] = useState(''); // Actual query used for fetching data

  // Fetch orders with pagination, status filter, and search query
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await OrderServiceClient.get('/get', {
        params: {
          limit: paginationModel.pageSize,
          offset: paginationModel.page * paginationModel.pageSize,
          status: activeTab !== 'all' ? activeTab : undefined,
          search: searchQuery || undefined,
        },
      });

      const fetchedOrders = response.data.orders;
      const totalOrders = response.data.total; // Ensure API returns total number of matching orders

      setOrders(fetchedOrders);
      setRowCount(totalOrders);

      // After fetching orders, fetch users for the current page's orders
      const userIds = [...new Set(fetchedOrders.map((order) => order.user_id))];
      if (userIds.length > 0) {
        const idsParam = userIds.join(','); // Convert array to comma-separated string
        const usersResponse = await UserServiceClient.get('/get', {
          params: { ids: idsParam },
        });
        setUsers(usersResponse.data.users || []);
      } else {
        setUsers([]);
      }

    } catch (error) {
      console.error('Error fetching orders or users:', error);
      toast.error('Error fetching order list');
    } finally {
      setLoading(false);
    }
  };

  // UseEffect to fetch orders whenever paginationModel, activeTab, or searchQuery changes
  useEffect(() => {
    fetchOrders();
  }, [paginationModel.page, paginationModel.pageSize, activeTab, searchQuery]);

  // Handle search
  const handleSearch = () => {
    setSearchQuery(searchText.trim()); // Update the search query to trigger data fetch
    setPaginationModel((prevModel) => ({ ...prevModel, page: 0 })); // Reset to the first page when searching
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await OrderServiceClient.put(`/update/${orderId}/status`, { status });
      toast.success('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error updating order status');
    }
  };

  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedOrder(null);
    setIsDetailModalOpen(false);
  };

  const openEditModal = (order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedOrder(null);
    setIsEditModalOpen(false);
  };

  const rows = Array.isArray(orders)
    ? orders.map((order) => ({
        ...order,
        id: order.id,
        userEmail: users.find((user) => user.id === order.user_id)?.email || 'Unknown',
        date: new Date(order.created_at).toLocaleDateString(),
      }))
    : [];

  const columns = [
    {
      field: 'id',
      headerName: 'Order',
      width: 100,
      renderCell: (params) => `#${params.value}`,
    },
    { field: 'userEmail', headerName: 'User', width: 200 },
    { field: 'date', headerName: 'Date', width: 150 },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (
        <span className={`status-badge ${params.value}`}>{params.value}</span>
      ),
    },
    {
      field: 'total_price',
      headerName: 'Total',
      width: 150,
      valueFormatter: (params) => {
        if (params.value === undefined || params.value === null) {
          return 'N/A';
        }
        const value = Number(params.value);
        return !isNaN(value) ? `${value.toFixed(2)} zł` : 'N/A';
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      renderCell: (params) => (
        <div className='actions-container'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openDetailModal(params.row);
            }}
          >
            View Details
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(params.row);
            }}
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(params.row);
            }}
          >
            Edit
          </button>
        </div>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <div className="order-list-page">
      <ToastContainer />
      <div className="tabs-container">
        {orderStatuses.map((status) => (
          <button
            key={status.key}
            className={`tab-button ${activeTab === status.key ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(status.key);
              setPaginationModel((prevModel) => ({ ...prevModel, page: 0 })); // Reset to first page when status changes
            }}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by order ID"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="order-list">
        <div style={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pagination
            paginationMode="server" // Enable server-side pagination
            rowCount={rowCount} // Total number of matching orders
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            loading={loading}
            disableSelectionOnClick
          />
        </div>

        {isDetailModalOpen && (
          <OrderDetailModal order={selectedOrder} onClose={closeDetailModal} />
        )}

        {isEditModalOpen && (
          <OrderEditModal
            order={selectedOrder}
            onClose={closeEditModal}
            onSubmit={(updatedOrderData) => {
              updateOrderStatus(selectedOrder.id, updatedOrderData.status);
              closeEditModal();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default OrderList;
