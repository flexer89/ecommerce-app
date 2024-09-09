import React, { useState, useEffect } from 'react';
import UserServiceClient from '../clients/UsersService';
import UserEditModal from './UserEditModal';
import '../assets/style/style.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user list
  const fetchUsers = async () => {
    try {
      const response = await UserServiceClient.get('/getall');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error fetching user list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
        toast.success('Pomyślnie edytowano.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                pauseOnHover: true
            }
        );
    } catch (error) {
      toast.error('Błąd podczas edytowania. Sprawdź wprowadzone dane', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        pauseOnHover: true
      });
    }
  };

  return (
    <div className="user-list-container">
      <h2>Users</h2>
      <ToastContainer />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="styled-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nazwa użytkownika</th>
              <th>Email</th>
              <th>Imię</th>
              <th>Nazwisko</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>
                  <button onClick={() => openEditModal(user)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

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
