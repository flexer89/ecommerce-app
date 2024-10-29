import React, { useState, useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';

const UserEditModal = ({ user, onClose, onSubmit }) => {
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [email, setEmail] = useState(user.email || '');

  const [attributes, setAttributes] = useState({
    phoneNumber: user.attributes?.phoneNumber || '',
    Address: user.attributes?.Address || '',
    City: user.attributes?.City || '',
    PostCode: user.attributes?.PostCode || '',
    voivodeship: user.attributes?.voivodeship || ''
  });

  useEffect(() => {
    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    setEmail(user.email || '');
    setAttributes({
      phoneNumber: user.attributes?.phoneNumber || '',
      Address: user.attributes?.Address || '',
      City: user.attributes?.City || '',
      PostCode: user.attributes?.PostCode || '',
      voivodeship: user.attributes?.voivodeship || ''
    });
  }, [user]);

  const handleSubmit = async () => {
    const updatedUserData = {
      firstName,
      lastName,
      email,
      attributes
    };

    await onSubmit(updatedUserData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit User</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <div className="modal-body">
          <label>Imię</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
          />

          <label>Nazwisko</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
          />

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />

          <label>Numer Telefonu</label>
          <input
            type="text"
            value={attributes.phoneNumber}
            onChange={(e) => setAttributes({ ...attributes, phoneNumber: e.target.value })}
            placeholder="Phone Number"
          />

          <label>Adres</label>
          <input
            type="text"
            value={attributes.Address}
            onChange={(e) => setAttributes({ ...attributes, Address: e.target.value })}
            placeholder="Address"
          />

          <label>Miasto</label>
          <input
            type="text"
            value={attributes.City}
            onChange={(e) => setAttributes({ ...attributes, City: e.target.value })}
            placeholder="City"
          />

          <label>Kod Pocztowy</label>
          <input
            type="text"
            value={attributes.PostCode}
            onChange={(e) => setAttributes({ ...attributes, PostCode: e.target.value })}
            placeholder="Post Code"
          />

          <label>Województwo</label>
          <input
            list="voivodeships"
            value={attributes.voivodeship}
            onChange={(e) => setAttributes({ ...attributes, voivodeship: e.target.value })}
            placeholder="Wybierz województwo"
          />
          <datalist id="voivodeships">
            <option value="dolnośląskie">Dolnośląskie</option>
            <option value="kujawsko-pomorskie">Kujawsko-Pomorskie</option>
            <option value="lubelskie">Lubelskie</option>
            <option value="lubuskie">Lubuskie</option>
            <option value="łódzkie">Łódzkie</option>
            <option value="małopolskie">Małopolskie</option>
            <option value="mazowieckie">Mazowieckie</option>
            <option value="opolskie">Opolskie</option>
            <option value="podkarpackie">Podkarpackie</option>
            <option value="podlaskie">Podlaskie</option>
            <option value="pomorskie">Pomorskie</option>
            <option value="śląskie">Śląskie</option>
            <option value="świętokrzyskie">Świętokrzyskie</option>
            <option value="warmińsko-mazurskie">Warmińsko-Mazurskie</option>
            <option value="wielkopolskie">Wielkopolskie</option>
            <option value="zachodniopomorskie">Zachodniopomorskie</option>
          </datalist>
        </div>
        <div className="modal-footer">
          <button onClick={handleSubmit} className="our-mission-button">Zapisz zmiany</button>
        </div>
      </div>
    </div>
  );
};

export default UserEditModal;
