export class CalculateResultService {
  public evaluateExpression(expression: string): number {
    // Remove all whitespace from the expression
    const cleanExpression = expression.replace(/\s+/g, '');
    
    // Split the expression into numbers and operators using regex
    const tokens = cleanExpression.match(/(-?\d*\.?\d+|[+\-*/])/g);
    
    if (!tokens) {
      throw new Error('Invalid expression');
    }
  
    // Convert string numbers to actual numbers and keep operators
    const parsedTokens = tokens.map(token => {
      return /[+\-*/]/.test(token) ? token : parseFloat(token);
    });
  
    // Perform calculations following operator precedence
    const calculate = (tokens: (number | string)[]): number => {
      // First pass: multiplication and division
      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] === '*' || tokens[i] === '/') {
          const left = tokens[i - 1] as number;
          const right = tokens[i + 1] as number;
          const result = tokens[i] === '*' ? left * right : left / right;
          tokens.splice(i - 1, 3, result);
          i -= 2;
        }
      }
  
      // Second pass: addition and subtraction
      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] === '+' || tokens[i] === '-') {
          const left = tokens[i - 1] as number;
          const right = tokens[i + 1] as number;
          const result = tokens[i] === '+' ? left + right : left - right;
          tokens.splice(i - 1, 3, result);
          i -= 2;
        }
      }
  
      return tokens[0] as number;
    };
  
    return calculate(parsedTokens);
  }
}
