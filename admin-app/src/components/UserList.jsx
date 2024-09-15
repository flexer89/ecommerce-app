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

  // Fetch users with pagination and optional search
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await UserServiceClient.get(`/get`, {
        params: {
          limit: paginationModel.pageSize,
          offset: paginationModel.page * paginationModel.pageSize,
          search: searchQuery,
        },
      });

      const fetchedUsers = response.data.users;
      const totalUsers = response.data.total; // Ensure this is the total number of matching users

      setUsers(fetchedUsers);
      setRowCount(totalUsers); // Set total matching users
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error fetching user list');
    } finally {
      setLoading(false);
    }
  };

  // UseEffect to fetch users whenever the paginationModel or search query changes
  useEffect(() => {
    fetchUsers();
  }, [paginationModel.page, paginationModel.pageSize, searchQuery]);

  // Handle search
  const handleSearch = () => {
    setSearchQuery(searchText); // Update the search query to trigger data fetch
    setPaginationModel((prevModel) => ({ ...prevModel, page: 0 })); // Reset to the first page when searching
  };

  // Redirect to User Profile page
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
      fetchUsers(); // Refresh the data after updating
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
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'username', headerName: 'Username', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'firstName', headerName: 'First Name', width: 150 },
    { field: 'lastName', headerName: 'Last Name', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <button onClick={(e) => { e.stopPropagation(); openEditModal(params.row); }}>
          Edit
        </button>
      ),
      sortable: false,
    },
  ];

  return (
    <div className="user-list-container">
      <h2>Users</h2>
      <ToastContainer />

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by username or email"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* DataGrid for modern table */}
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          pagination
          paginationMode="server" // Enable server-side pagination
          rowCount={rowCount} // Set the total row count for pagination
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          loading={loading}
          onRowClick={handleRowClick}
          disableSelectionOnClick
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
