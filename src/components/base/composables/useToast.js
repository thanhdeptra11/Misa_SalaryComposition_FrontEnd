import { reactive } from 'vue';
// Đây là 1 singleton để mọi nơi gọi useToast() qua 1 state dùng chung
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
    // Ẩn toast cũ
    toastState.visible = false;

    setTimeout(() => {
      toastState.message = message;
      toastState.type = type;
      toastState.duration = duration;
      toastState.position = position;
      // Đẩy việc hiển thị sang tick tiếp theo
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
