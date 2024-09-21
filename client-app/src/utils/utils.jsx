const formatDateTime = (input) => {
    const [datePart, timePart] = input.split(' | ');
  
    const [day, month, year] = datePart.split('.');
    const [hour, minute] = timePart.split(':');
  
    const formattedDate = `${year}-${month}-${day}T${hour}:${minute}`;
  
    return formattedDate;
  };

const statusTranslationMap = {
    pending: 'W toku',
    shipped: 'Wysłane',
    delivered: 'Dostarczone',
    cancelled: 'Anulowane',
};

const orderStatusTranslationMap = {
    pending: 'W toku',
    processing: 'Przetwarzane',
    shipped: 'Wysłane',
    delivered: 'Dostarczone',
    cancelled: 'Anulowane',
    on_hold: 'Wstrzymane',
};

const orderStatuses = [
  { label: 'Wszystko', key: 'all' },
  { label: 'W toku', key: 'pending' },
  { label: 'Przetwarzane', key: 'processing' },
  { label: 'Wysłane', key: 'shipped' },
  { label: 'Dostarczone', key: 'delivered' },
  { label: 'Anulowane', key: 'cancelled' },
  { label: 'Wstrzymane', key: 'on_hold' },
];

const shipmentStatuses = {
  pending: 'W toku',
  shipped: 'Wysłane',
  delivered: 'Dostarczone',
  cancelled: 'Anulowane',
};

export { formatDateTime, statusTranslationMap, orderStatusTranslationMap, orderStatuses, shipmentStatuses };