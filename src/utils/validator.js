import { t } from '@/utils/resourseReader';

export const required = (fieldKey) => {
  return (value) => {
    const isEmptyArray = Array.isArray(value) && value.length === 0;
    const isEmptyValue = !Array.isArray(value) && !String(value ?? '').trim();

    if (isEmptyArray || isEmptyValue) {
      return t('validation.required', '');
    }

    return '';
  };
};

export const maxLength = (fieldKey, max) => {
  return (value) => {
    if (!value) return '';

    if (String(value).length > max) {
      return t('validation.maxLength', {
        field: t(fieldKey),
        max
      });
    }

    return '';
  };
};
