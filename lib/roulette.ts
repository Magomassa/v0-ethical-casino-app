// Números de la ruleta europea (0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26)
// Orden de los números en la ruleta europea (en sentido horario)
export const EUROPEAN_WHEEL = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// Números rojos en la ruleta
export const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

// Tipos de apuestas
export type BetType = 
  | 'straight' // Apuesta directa a un número
  | 'split'    // Apuesta a dos números adyacentes
  | 'street'   // Apuesta a una fila de tres números
  | 'corner'   // Apuesta a cuatro números que forman un cuadrado
  | 'line'     // Apuesta a dos calles adyacentes (6 números)
  | 'column'   // Apuesta a una columna vertical (12 números)
  | 'dozen'    // Apuesta a una docena (1-12, 13-24, 25-36)
  | 'red'      // Apuesta a rojo
  | 'black'    // Apuesta a negro
  | 'even'     // Apuesta a par
  | 'odd'      // Apuesta a impar
  | 'low'      // Apuesta a bajo (1-18)
  | 'high';    // Apuesta a alto (19-36)

// Estructura de una apuesta
export interface Bet {
  type: BetType;
  numbers: number[];
  amount: number;
  id: string;
}

// Interfaz para el resultado de la ruleta
export interface RouletteResult {
  number: number;
  color: 'red' | 'black' | 'green';
  isEven: boolean;
  isLow: boolean; // 1-18
  dozen: 1 | 2 | 3; // 1-12, 13-24, 25-36
  column: 1 | 2 | 3; // Columna (1,4,7...), (2,5,8...), (3,6,9...)
}

// Función para determinar el color de un número
export function getNumberColor(number: number): 'red' | 'black' | 'green' {
  if (number === 0) return 'green';
  return RED_NUMBERS.includes(number) ? 'red' : 'black';
}

// Función para determinar si un número es par
export function isEven(number: number): boolean {
  return number !== 0 && number % 2 === 0;
}

// Función para determinar la docena de un número (1-12, 13-24, 25-36)
export function getDozen(number: number): 1 | 2 | 3 | null {
  if (number === 0) return null;
  if (number >= 1 && number <= 12) return 1;
  if (number >= 13 && number <= 24) return 2;
  return 3;
}

// Función para determinar la columna de un número (1,4,7...), (2,5,8...), (3,6,9...)
export function getColumn(number: number): 1 | 2 | 3 | null {
  if (number === 0) return null;
  return ((number - 1) % 3 + 1) as 1 | 2 | 3;
}

// Función para obtener los detalles de un número en la ruleta
export function getNumberDetails(number: number): RouletteResult {
  return {
    number,
    color: getNumberColor(number),
    isEven: isEven(number),
    isLow: number >= 1 && number <= 18,
    dozen: getDozen(number) || 1,
    column: getColumn(number) || 1,
  };
}

// Función para generar un ID único
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Función para calcular las ganancias
export function calculatePayout(bets: Bet[], result: RouletteResult): number {
  let winnings = 0;
  
  for (const bet of bets) {
    if (isWinningBet(bet, result)) {
      winnings += bet.amount * getPayoutMultiplier(bet.type);
    }
  }
  
  return winnings;
}

// Función para determinar si una apuesta es ganadora
function isWinningBet(bet: Bet, result: RouletteResult): boolean {
  const { number } = result;
  
  switch (bet.type) {
    case 'straight':
      return bet.numbers.includes(number);
    case 'red':
      return number !== 0 && RED_NUMBERS.includes(number);
    case 'black':
      return number !== 0 && !RED_NUMBERS.includes(number);
    case 'even':
      return number !== 0 && isEven(number);
    case 'odd':
      return number % 2 === 1;
    case 'low':
      return number >= 1 && number <= 18;
    case 'high':
      return number >= 19 && number <= 36;
    case 'dozen':
      const dozen = getDozen(number);
      return dozen !== null && bet.numbers[0] <= dozen * 12 && bet.numbers[0] > (dozen - 1) * 12;
    case 'column':
      const column = getColumn(number);
      return column !== null && bet.numbers.some(n => (n - 1) % 3 === column - 1);
    // Implementar otros tipos de apuestas (split, street, corner, line) según sea necesario
    default:
      return false;
  }
}

// Función para obtener el multiplicador de pago según el tipo de apuesta
function getPayoutMultiplier(betType: BetType): number {
  switch (betType) {
    case 'straight':
      return 35;
    case 'split':
      return 17;
    case 'street':
      return 11;
    case 'corner':
      return 8;
    case 'line':
      return 5;
    case 'column':
    case 'dozen':
      return 2;
    case 'red':
    case 'black':
    case 'even':
    case 'odd':
    case 'low':
    case 'high':
      return 1;
    default:
      return 0;
  }
}

// Función para girar la ruleta y obtener un número aleatorio
export function spinWheel(): number {
  const randomIndex = Math.floor(Math.random() * EUROPEAN_WHEEL.length);
  return EUROPEAN_WHEEL[randomIndex];
}
