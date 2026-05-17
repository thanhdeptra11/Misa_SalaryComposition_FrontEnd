export const GLOBAL_CONSTANTS = {
  EMPTY_GUID: '00000000-0000-0000-0000-000000000000',
  TOOL_TIP_EXCEED_NORM: 'Nếu không tích chọn thì khi tính giá trị của thành phần lương này mà số tiền vượt quá định mức thì chương trình sẽ tự động lấy tối đa bằng định mức đã nhập',
  DEFAULT_STATUS_FOLLOWING: 1,
  DEFAULT_STATUS_UNFOLLOWING: 0,
  DEFAULT_STATUS_FILTER: 99,
  STATUS_CHANGE_CONFIRM_MESSAGE: (name, nextStatusText) =>
    `Bạn có chắc chắn muốn chuyển trạng thái thành phần lương ${name} sang ${nextStatusText} không?`
};
