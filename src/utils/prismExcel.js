import Prism from 'prismjs/components/prism-core'
Prism.languages.excel = {
  // PHU_CAP_01, THU_NHAP_CHIU_THUE
//   Bắt đàu bằng chữ hoa A-Z giữa có thể có _, kết thúc bằng chữ hoa hoặc số
  'variable': {
    pattern: /\b[A-Z][A-Z0-9_]*[A-Z0-9]\b/,
    greedy: true
  },
//   Bắt đầu bằng dấu " và kết thúc bằng dấu "
  'string': {
    pattern: /"(?:[^"]|\\.)*"/,
    greedy: true
  },
//   Một hoặc nhiều số, có phần thập phân hoặc không, đóng mở bằng ranh giới từ
  'number': /\b\d+(\.\d+)?\b/,
// Match với các toán tử
  'operator': /<=|>=|<>|[+\-*\/=<>]/,
// Match với các dấu 
  'punctuation': /[(),;]/,
}

export default Prism