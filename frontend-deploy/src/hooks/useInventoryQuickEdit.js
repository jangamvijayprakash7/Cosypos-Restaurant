import { useState } from 'react';
import { useUser } from '../pages/UserContext';

export function useInventoryQuickEdit() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    // Only allow staff and admin users to open the modal
    if (user && (user.role === 'STAFF' || user.role === 'ADMIN')) {
      setIsOpen(true);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleUpdate = (updatedItem) => {
    // This can be used to notify parent components of updates
    console.log('Inventory item updated:', updatedItem);
  };

  return {
    isOpen,
    openModal,
    closeModal,
    handleUpdate,
    canAccess: user && (user.role === 'STAFF' || user.role === 'ADMIN')
  };
}
