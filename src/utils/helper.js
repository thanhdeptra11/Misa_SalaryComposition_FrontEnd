export const cleanPayload = (payload) => {
  const cleanValue = (value) => {
    if (value === undefined || value === null) {
      return null;
    }

    if (typeof value === 'string') {
      const trimmedValue = value.trim();

      return trimmedValue === '' ? null : trimmedValue;
    }

    if (Array.isArray(value)) {
      return value.length === 0 ? null : value;
    }

    if (typeof value === 'object') {
      return cleanPayload(value);
    }

    return value;
  };

  return Object.keys(payload).reduce((result, key) => {
    result[key] = cleanValue(payload[key]);

    return result;
  }, {});
};
