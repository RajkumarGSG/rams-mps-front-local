// format_helpers.js
const numStyle0 = { style: "decimal", minimumFractionDigits: 0, maximumFractionDigits: 0 };
const numStyle2 = { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 };
const numStyle3 = { style: "decimal", minimumFractionDigits: 3, maximumFractionDigits: 3 };

export function numFormat(value, styleType = 2) {
  let numStyle;
  switch (styleType) {
    case 0:
      numStyle = numStyle0;
      break;
    case 3:
      numStyle = numStyle3;
      break;
    case 2:
    default:
      numStyle = numStyle2;
      break;
  }
  return !value ? 0 : value.toLocaleString("kg-KG", numStyle);
}

export function dateFormat(value, showTime = false) {
  if (!value) return '';
  const date = new Date(value); // Преобразуем строку в объект Date
  if (isNaN(date.getTime())) {  // Проверяем, является ли это валидной датой
    return value; // Если не валидная дата, возвращаем исходное значение
  }
  return showTime ? date.toLocaleString("kg-KG") : date.toLocaleDateString()
}