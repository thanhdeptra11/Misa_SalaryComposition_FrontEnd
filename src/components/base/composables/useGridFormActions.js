import { ref } from 'vue';

export const useGridFormActions = () => {
  const isShowingForm = ref(false);
  const formMode = ref('create');
  const editingItem = ref(null);

  const handleCreate = () => {
    formMode.value = 'create';
    editingItem.value = null;
    isShowingForm.value = true;
  };

  const handleEdit = (row) => {
    formMode.value = 'edit';
    editingItem.value = row;
    isShowingForm.value = true;
  };

  const handleClone = (row) => {
    formMode.value = 'clone';
    editingItem.value = row;
    isShowingForm.value = true;
  };

  const handleCloseForm = () => {
    isShowingForm.value = false;
    formMode.value = 'create';
    editingItem.value = null;
  };

  return {
    isShowingForm,
    formMode,
    editingItem,
    handleCreate,
    handleEdit,
    handleClone,
    handleCloseForm
  };
};