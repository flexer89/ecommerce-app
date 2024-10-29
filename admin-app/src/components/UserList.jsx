import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import UserServiceClient from '../clients/UsersService';
import UserEditModal from './UserEditModal';
import '../assets/style/style.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserList = () => {
  const [users, setUsers] = useState([]); // Store current page of users
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(''); // Input value for search
  const [searchQuery, setSearchQuery] = useState(''); // Actual query used for fetching data
  const [rowCount, setRowCount] = useState(0); // Total number of rows
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let fetchedUsers = [];
      let totalUsers = 0;
      // If serachText is a valid UUID, fetch user by ID
      if (searchText.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)) {
        const response = await UserServiceClient.get(`/get/${searchText}`);
        fetchedUsers = response.data.users;
        totalUsers = response.data.total;
      }
      else {
        const response = await UserServiceClient.get(`/get`, {
          params: {
            limit: paginationModel.pageSize,
            offset: paginationModel.page * paginationModel.pageSize,
            search: searchQuery,
          },
        });

        totalUsers = response.data.total;
        fetchedUsers = response.data.users;
      }

      setUsers(fetchedUsers);
      setRowCount(totalUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error fetching user list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [paginationModel.page, paginationModel.pageSize, searchQuery]);

  const handleSearch = () => {
    setSearchQuery(searchText);
    setPaginationModel((prevModel) => ({ ...prevModel, page: 0 }));
  };

  const handleRowClick = (params) => {+
    navigate(`/users/${params.id}`);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedUser(null);
    setIsEditModalOpen(false);
  };

  const handleUserUpdate = async (updatedUserData) => {
    try {
      await UserServiceClient.patch(`/update/${selectedUser.id}`, updatedUserData);
      toast.success('User updated successfully.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      closeEditModal();
      fetchUsers();
    } catch (error) {
      toast.error('Error updating user. Please check the data entered.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', flex: 1 },
    { field: 'username', headerName: 'Nazwa użytkownika', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'firstName', headerName: 'Imię', flex: 1 },
    { field: 'lastName', headerName: 'Nazwisko', flex: 1 },
    {
      field: 'actions',
      headerName: 'Akcje',
      width: 150,
      renderCell: (params) => (
        <button onClick={(e) => { e.stopPropagation(); openEditModal(params.row); }}>
          Edytuj
        </button>
      ),
      sortable: false,
    },
  ];

  return (
    <div className="user-list-container">
      <h2>Użytkownicy</h2>
      <ToastContainer />
      <div className="search-bar">
        <input
          type="text"
          placeholder="Wyszukaj po emailu lub ID."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button className='our-mission-button' onClick={handleSearch}>Wyszukaj</button>
      </div>
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={users}
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

      {isEditModalOpen && (
        <UserEditModal
          user={selectedUser}
          onClose={closeEditModal}
          onSubmit={handleUserUpdate}
        />
      )}
    </div>
  );
};

export default UserList;
