import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import ShipmentServiceClient from '../clients/ShipmentsService';
import '../assets/style/style.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ShipmentDetailModal from './ShipmentDetailModal';
import ShipmentEditModal from './ShipmentEditModal';
import { statusTranslationMap, orderStatuses } from '../utils/utils';


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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for opening edit modal

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await ShipmentServiceClient.get('/get', {
        params: {
          limit: paginationModel.pageSize,
          offset: paginationModel.page * paginationModel.pageSize,
          status: activeTab !== 'all' ? activeTab : undefined,
          search: searchQuery || undefined,
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

  const openEditModal = (shipment) => {
    setSelectedShipment(shipment);
    setIsEditModalOpen(true); // Open the edit modal
  };

  const closeEditModal = () => {
    setSelectedShipment(null);
    setIsEditModalOpen(false); // Close the edit modal
  };

  const handleEditSubmit = async (updatedShipmentData, shipmentId) => {
    try {
      await ShipmentServiceClient.patch(`/update/${shipmentId}`, updatedShipmentData);
      toast.success('Shipment updated successfully!');
      fetchShipments();
    } catch (error) {
      console.error('Error updating shipment:', error);
      toast.error('Error updating shipment');
    } finally {
      closeEditModal();
    }
  };

  const rows = shipments.map((shipment) => ({
    ...shipment,
    shipment_date: shipment.shipment_date
      ? new Date(shipment.shipment_date).toLocaleDateString('pl-PL') + ' | ' + new Date(shipment.shipment_date).toLocaleTimeString('pl-PL')
      : 'Brak daty',
    delivery_date: shipment.delivery_date
      ? new Date(shipment.delivery_date).toLocaleDateString('pl-PL') + ' | ' + new Date(shipment.delivery_date).toLocaleTimeString('pl-PL')
      : 'Brak daty',
  }));

  const columns = [
    { field: 'id', headerName: 'ID wysyłki', flex: 0.75 }, // Używamy flex zamiast width
    { field: 'user_id', headerName: 'ID użytkownika', flex: 1.5 }, 
    { field: 'order_id', headerName: 'ID zamówienia', flex: 0.75 }, 
    { field: 'shipment_address', headerName: 'Adres dostawy', flex: 2 }, 
    { field: 'shipment_date', headerName: 'Data wysyłki', flex: 1 }, // Data już sformatowana w mapowaniu
    { field: 'delivery_date', headerName: 'Data dostawy', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => {
        const translatedStatus = statusTranslationMap[params.value] || 'Nieznany'; // Jeśli status jest nieznany, pokaż fallback
        return (
          <span className={`status-badge ${params.value}`}>{translatedStatus}</span>
        );
      },
    },
    { field: 'company', headerName: 'Firma', flex: 1 },
    {
      field: 'actions',
      headerName: 'Akcje',
      flex: 1.5,
      renderCell: (params) => (
        <div className="actions-container">
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
    <div className="shipments-page container">
      <ToastContainer />
      <h2>Wysyłki</h2>
      <div className="tabs-container">
        {orderStatuses.map((status) => (
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
          placeholder="Wyszukaj po ID zamówienia"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button className='our-mission-button' onClick={handleSearch}>Wyszukaj</button>
      </div>

      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pagination
          paginationMode="server"
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          loading={loading}
          disableSelectionOnClick
          sx={{
            fontSize: '1.1rem',
          }}
        />
      </div>

      {/* Shipment Detail Modal */}
      {isDetailModalOpen && (
        <ShipmentDetailModal
          shipment={selectedShipment}
          onClose={closeDetailModal}
        />
      )}

      {/* Shipment Edit Modal */}
      {isEditModalOpen && (
        <ShipmentEditModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onSubmit={handleEditSubmit}
          shipment={selectedShipment}
        />
      )}
    </div>
  );
};

export default ShipmentComponent;
