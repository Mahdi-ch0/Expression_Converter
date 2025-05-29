// src/lib/conversion.ts

const getPrecedence = (op: string): number => {
  switch (op) {
    case '+':
    case '-':
      return 1;
    case '*':
    case '/':
      return 2;
    // Add ^ for exponentiation if needed, typically precedence 3 and right-associative
    default:
      return 0;
  }
};

const isOperator = (char: string): boolean => {
  return ['+', '-', '*', '/'].includes(char);
};

const isOperand = (char: string): boolean => {
  return /^[a-zA-Z0-9]$/.test(char);
};

export const infixToPostfix = (infix: string): string => {
  if (!infix.trim()) return "";
  const stack: string[] = [];
  let postfix = '';
  const sanitizedInfix = infix.replace(/\s+/g, '');

  for (const char of sanitizedInfix) {
    if (isOperand(char)) {
      postfix += char;
    } else if (char === '(') {
      stack.push(char);
    } else if (char === ')') {
      while (stack.length > 0 && stack[stack.length - 1] !== '(') {
        postfix += stack.pop();
      }
      if (stack.length === 0) throw new Error("Mismatched parentheses: Unexpected ')'");
      stack.pop(); // Pop '('
    } else if (isOperator(char)) {
      while (
        stack.length > 0 &&
        stack[stack.length - 1] !== '(' &&
        getPrecedence(stack[stack.length - 1]!) >= getPrecedence(char)
      ) {
        postfix += stack.pop();
      }
      stack.push(char);
    } else {
      throw new Error(`Invalid character in expression: ${char}`);
    }
  }

  while (stack.length > 0) {
    if (stack[stack.length - 1] === '(') throw new Error("Mismatched parentheses: Unclosed '('");
    postfix += stack.pop();
  }
  return postfix;
};

export const infixToPrefix = (infix: string): string => {
  if (!infix.trim()) return "";
  const reversedInfix = infix.replace(/\s+/g, '').split('').reverse().join('');
  let tempInfix = '';
  for (const char of reversedInfix) {
    if (char === '(') {
      tempInfix += ')';
    } else if (char === ')') {
      tempInfix += '(';
    } else {
      tempInfix += char;
    }
  }
  try {
    const postfix = infixToPostfix(tempInfix);
    return postfix.split('').reverse().join('');
  } catch (e) {
    if (e instanceof Error) {
       // Adjust error message for context
      if (e.message.includes("Mismatched parentheses: Unexpected ')'")) {
        throw new Error("Mismatched parentheses: Unexpected '(' in original expression");
      }
      if (e.message.includes("Mismatched parentheses: Unclosed '('")) {
        throw new Error("Mismatched parentheses: Unclosed ')' in original expression");
      }
    }
    throw e;
  }
};

export const prefixToInfix = (prefix: string): string => {
  if (!prefix.trim()) return "";
  const stack: string[] = [];
  const sanitizedPrefix = prefix.replace(/\s+/g, '').split('').reverse();

  for (const char of sanitizedPrefix) {
    if (isOperand(char)) {
      stack.push(char);
    } else if (isOperator(char)) {
      if (stack.length < 2) throw new Error("Invalid prefix expression: insufficient operands for operator.");
      const op1 = stack.pop()!;
      const op2 = stack.pop()!;
      stack.push(`(${op1}${char}${op2})`);
    } else {
      throw new Error(`Invalid character in prefix expression: ${char}`);
    }
  }
  if (stack.length !== 1) throw new Error("Invalid prefix expression format.");
  return stack[0]!;
};

export const prefixToPostfix = (prefix: string): string => {
  if (!prefix.trim()) return "";
  const infix = prefixToInfix(prefix);
  return infixToPostfix(infix);
};

export const postfixToInfix = (postfix: string): string => {
  if (!postfix.trim()) return "";
  const stack: string[] = [];
  const sanitizedPostfix = postfix.replace(/\s+/g, '');

  for (const char of sanitizedPostfix) {
    if (isOperand(char)) {
      stack.push(char);
    } else if (isOperator(char)) {
      if (stack.length < 2) throw new Error("Invalid postfix expression: insufficient operands for operator.");
      const op2 = stack.pop()!;
      const op1 = stack.pop()!;
      stack.push(`(${op1}${char}${op2})`);
    } else {
      throw new Error(`Invalid character in postfix expression: ${char}`);
    }
  }
  if (stack.length !== 1) throw new Error("Invalid postfix expression format.");
  return stack[0]!;
};

export const postfixToPrefix = (postfix: string): string => {
  if (!postfix.trim()) return "";
  const infix = postfixToInfix(postfix);
  return infixToPrefix(infix);
};
