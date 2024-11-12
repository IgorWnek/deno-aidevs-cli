export class CalculateResultService {
  public evaluateExpression(expression: string): number {
    const cleanExpression = expression.replace(/\s+/g, '');

    if (!cleanExpression) {
      throw new Error('Invalid expression: empty input');
    }

    try {
      const tokens = this.tokenize(cleanExpression);
      return this.calculate(tokens);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Invalid expression: ${message}`);
    }
  }

  private tokenize(expression: string): (number | string)[] {
    const tokens: (number | string)[] = [];
    let currentNumber = '';
    let isNegative = false;

    for (let i = 0; i < expression.length; i++) {
      const char = expression[i];

      if (char === '-' && (i === 0 || /[+\-*/]/.test(expression[i - 1]))) {
        isNegative = true;
        continue;
      }

      if (/\d|\./.test(char)) {
        currentNumber += char;
      } else if (/[+\-*/]/.test(char)) {
        if (currentNumber) {
          tokens.push(isNegative ? -parseFloat(currentNumber) : parseFloat(currentNumber));
          currentNumber = '';
          isNegative = false;
        }
        tokens.push(char);
      } else {
        throw new Error('Invalid character in expression');
      }
    }

    if (currentNumber) {
      tokens.push(isNegative ? -parseFloat(currentNumber) : parseFloat(currentNumber));
    }

    if (tokens.length < 3 || typeof tokens[0] !== 'number') {
      throw new Error('Invalid expression format');
    }

    return tokens;
  }

  private calculate(tokens: (number | string)[]): number {
    const numbers: number[] = [];
    const operators: string[] = [];

    for (const token of tokens) {
      if (typeof token === 'number') {
        numbers.push(token);
      } else {
        while (
          operators.length > 0 &&
          this.getPrecedence(operators[operators.length - 1]) >= this.getPrecedence(token as string)
        ) {
          this.executeOperation(numbers, operators);
        }
        operators.push(token as string);
      }
    }

    while (operators.length > 0) {
      this.executeOperation(numbers, operators);
    }

    if (numbers.length !== 1) {
      throw new Error('Invalid expression structure');
    }

    return numbers[0];
  }

  private getPrecedence(operator: string): number {
    switch (operator) {
      case '+':
      case '-':
        return 1;
      case '*':
      case '/':
        return 2;
      default:
        return 0;
    }
  }

  private executeOperation(numbers: number[], operators: string[]): void {
    if (numbers.length < 2 || operators.length < 1) {
      throw new Error('Invalid expression structure');
    }

    const operator = operators.pop()!;
    const right = numbers.pop()!;
    const left = numbers.pop()!;

    let result: number;
    switch (operator) {
      case '+':
        result = left + right;
        break;
      case '-':
        result = left - right;
        break;
      case '*':
        result = left * right;
        break;
      case '/':
        if (right === 0) {
          throw new Error('Division by zero');
        }
        result = left / right;
        break;
      default:
        throw new Error('Invalid operator');
    }

    numbers.push(result);
  }
}
