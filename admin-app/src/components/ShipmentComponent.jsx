import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import ShipmentServiceClient from '../clients/ShipmentsService';
import '../assets/style/style.css';
import dayjs from 'dayjs';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ShipmentDetailModal from './ShipmentDetailModal';

const shipmentStatuses = [
  { label: 'All', key: 'all' },
  { label: 'Pending', key: 'pending' },
  { label: 'Shipped', key: 'shipped' },
  { label: 'Delivered', key: 'delivered' },
  { label: 'Cancelled', key: 'cancelled' },
];

const ShipmentComponent = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });

  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedShipment, setSelectedShipment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await ShipmentServiceClient.get('/get', {
        params: {
          limit: paginationModel.pageSize,
          offset: paginationModel.page * paginationModel.pageSize,
          status: activeTab !== 'all' ? activeTab : undefined,
          query: searchQuery || undefined,
        },
      });
      const fetchedShipments = response.data.shipments || [];
      const totalShipments = response.data.total || 0;

      setShipments(fetchedShipments);
      setRowCount(totalShipments);
    } catch (error) {
      console.error('Error fetching shipments:', error);
      toast.error('Error fetching shipments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [paginationModel.page, paginationModel.pageSize, activeTab, searchQuery]);

  const handleSearch = () => {
    setSearchQuery(searchText.trim());
    setPaginationModel((prevModel) => ({ ...prevModel, page: 0 }));
  };

  const openDetailModal = (shipment) => {
    setSelectedShipment(shipment);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedShipment(null);
    setIsDetailModalOpen(false);
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'user_id', headerName: 'User ID', width: 150 },
    { field: 'order_id', headerName: 'Order ID', width: 150 },
    { field: 'shipment_address', headerName: 'Shipment Address', width: 250 },
    {
      field: 'shipment_date',
      headerName: 'Shipment Date',
      width: 150,
      valueFormatter: (params) =>
        new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'delivery_date',
      headerName: 'Delivery Date',
      width: 150,
      valueFormatter: (params) =>
        new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (
        <span className={`status-badge ${params.value}`}>{params.value}</span>
      ),
    },
    { field: 'company', headerName: 'Company', width: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openDetailModal(params.row);
          }}
        >
          View Details
        </button>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <div className="shipments-page">
      <ToastContainer />
      <h2>Shipments</h2>

      {/* Tabs for shipment statuses */}
      <div className="tabs-container">
        {shipmentStatuses.map((status) => (
          <button
            key={status.key}
            className={`tab-button ${activeTab === status.key ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(status.key);
              setPaginationModel((prevModel) => ({ ...prevModel, page: 0 }));
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
          placeholder="Search by shipment ID, user ID, order ID, or company"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Shipments DataGrid */}
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={shipments}
          columns={columns}
          pagination
          paginationMode="server"
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          loading={loading}
          disableSelectionOnClick
        />
      </div>

      {/* Shipment Detail Modal */}
      {isDetailModalOpen && (
        <ShipmentDetailModal
          shipment={selectedShipment}
          onClose={closeDetailModal}
        />
      )}
    </div>
  );
};

export default ShipmentComponent;
