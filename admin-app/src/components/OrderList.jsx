import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import OrderServiceClient from '../clients/OrdersService';
import UserServiceClient from '../clients/UsersService';
import OrderDetailModal from './OrderDetailModal';
import OrderEditModal from './OrderEditModal';
import { statusTranslationMap, orderStatuses } from '../utils/utils';
import '../assets/style/style.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


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
  const navigate = useNavigate();

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
      const totalOrders = response.data.total;

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

  // Redirect to User Profile page
  const handleRowClick = (params) => {
    navigate(`/users/${params.row.user_id}`);
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
        user_id: order.user_id,
        total_price: order.total_price,
        date: new Date(order.created_at).toLocaleDateString() + ' | ' + new Date(order.created_at).toLocaleTimeString(),
      }))
    : [];

  const columns = [
    {
      field: 'id',
      headerName: 'ID zamówienia',
      flex: 0.5,
      renderCell: (params) => `#${params.value}`,
    },
    { field: 'user_id', headerName: 'Użytkownik', flex: 1.5},
    { field: 'date', headerName: 'Data', flex: 1, },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => {
        const translatedStatus = statusTranslationMap[params.value] || 'Nieznany';
        return (
          <span className={`status-badge ${params.value}`}>{translatedStatus}</span>
        );
      },
    },
    {
      field: 'total_price',
      headerName: 'Wartość zamówienia',
      flex: 1,
      renderCell: (params) => `${params.value.toFixed(2)} zł`,
    },
    {
      field: 'actions',
      headerName: 'Akcje',
      flex: 1,
      renderCell: (params) => (
        <div className='actions-container'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openDetailModal(params.row);
            }}
          >
            Szczegóły
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(params.row);
            }}
          >
            Edytuj
          </button>
        </div>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <div className="order-list-page container">
      <ToastContainer />
      <h2>Zamówienia</h2>
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
      <div className="search-bar">
        <input
          type="text"
          placeholder="Wyszukaj po ID zamówienia"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button className='our-mission-button' onClick={handleSearch}>Wyszukaj</button>
      </div>

      <div className="order-list">
        <div className='datagrid-container'>
          <DataGrid
            rows={rows}
            columns={columns}
            pagination
            paginationMode="server"
            rowCount={rowCount}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            loading={loading}
            onRowClick={handleRowClick}
            disableSelectionOnClick
            sx={{
              fontSize: '1.1rem',
            }}
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
