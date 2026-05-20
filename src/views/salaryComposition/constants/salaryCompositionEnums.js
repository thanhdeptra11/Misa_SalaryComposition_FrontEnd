import { ENUM_NAMES } from '@/constants/enumDisplayConstants';

export const enumConfigs = [
  {
    enumName: ENUM_NAMES.COMPOSITION_TYPE,
    sourceField: 'compositionType',
    targetField: 'compositionTypeDesc',
    fallback: '-'
  },
  {
    enumName: ENUM_NAMES.FOLLOW_STATUS,
    sourceField: 'status',
    targetField: 'statusDesc',
    fallback: '-'
  },
  {
    enumName: ENUM_NAMES.COMPOSITION_PROPERTY,
    sourceField: 'property',
    targetField: 'propertyDesc',
    fallback: '-'
  },
  {
    enumName: ENUM_NAMES.TAX_APPLIED_TYPE,
    sourceField: 'taxableType',
    targetField: 'taxableTypeDesc',
    fallback: '-'
  },
  {
    enumName: ENUM_NAMES.MI_VALUE_TYPE,
    sourceField: 'valueType',
    targetField: 'valueTypeDesc',
    fallback: '-'
  },
  {
    enumName: ENUM_NAMES.DISPLAY_PAYROLL_TYPE,
    sourceField: 'showOnPayslip',
    targetField: 'showOnPayslipDesc',
    fallback: '-'
  }
];
