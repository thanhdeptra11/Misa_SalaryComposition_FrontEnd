import { reactive } from 'vue';

const toastState = reactive({
  visible: false,
  message: '',
  type: 'success',
  duration: 2000,
  position: 'top-center'
});

export const useToast = () => {
  const showToast = ({
    message,
    type = 'success',
    duration = 3000,
    position = 'top-center'
  }) => {
    toastState.visible = false;

    setTimeout(() => {
      toastState.message = message;
      toastState.type = type;
      toastState.duration = duration;
      toastState.position = position;
      toastState.visible = true;
    }, 0);
  };

  const showSuccess = (message) => {
    showToast({ message, type: 'success' });
  };

  const showError = (message) => {
    showToast({ message, type: 'error' });
  };

  const showWarning = (message) => {
    showToast({ message, type: 'warning' });
  };

  return {
    toastState,
    showToast,
    showSuccess,
    showError,
    showWarning
  };
};
