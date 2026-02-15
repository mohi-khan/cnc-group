/**
 * Formats a number according to the Indian numbering system
 * (with commas at thousand, lakh, and crore places)
 * 
 * Examples:
 * 1000 -> 1,000
 * 100000 -> 1,00,000 (1 lakh)
 * 10000000 -> 1,00,00,000 (1 crore)
 * 1000000000 -> 100,00,00,000 (100 crore)
 * 
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string in Indian number format
 */
export function formatIndianNumber(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00'
  }

  // Handle negative numbers
  const isNegative = value < 0
  const absoluteValue = Math.abs(value)

  // Split into integer and decimal parts
  const fixedValue = absoluteValue.toFixed(decimals)
  const [integerPart, decimalPart] = fixedValue.split('.')

  // Convert to string and reverse for easier processing
  const reversedInteger = integerPart.split('').reverse().join('')

  let formatted = ''

  for (let i = 0; i < reversedInteger.length; i++) {
    if (i === 3 || (i > 3 && (i - 3) % 2 === 0)) {
      formatted = ',' + formatted
    }
    formatted = reversedInteger[i] + formatted
  }

  // Add decimal part if decimals > 0
  const result = decimals > 0 ? `${formatted}.${decimalPart}` : formatted

  // Add negative sign if needed
  return isNegative ? `-${result}` : result
}

/**
 * Formats a number in Indian format without decimals
 */
export function formatIndianNumberInteger(value: number | null | undefined): string {
  return formatIndianNumber(value, 0)
}