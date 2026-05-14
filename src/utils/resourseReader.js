
import { vrResource } from '@/resources/validateResource';
// Hàm đọc và trả về giá trị theo key dạng x.y.z
const getByPath = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

export const t = (key, params = {}) => {
  let message = getByPath(vrResource, key) || key;
  Object.keys(params).forEach((paramKey) => {
    message = message.replace(`{${paramKey}}`, params[paramKey]);
  });
//   Bỏ placeholder nếu không có param
  message = message.replace(/\{[^}]+\}/g, '').trim();
//   Viết hoa chữ cái đầu tiên
  return capitalizeFirstLetter(message);
};
const capitalizeFirstLetter = (value) => {
  if (!value) return '';

  return value.charAt(0).toUpperCase() + value.slice(1);
};