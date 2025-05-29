
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
      return 0; // For parentheses or non-operators
  }
};

const isOperator = (token: string): boolean => {
  return ['+', '-', '*', '/'].includes(token);
};

// Tokenizer for infix expressions
// Handles numbers, operators, and parentheses. Ignores spaces.
const tokenizeInfix = (expression: string): string[] => {
  const tokens: string[] = [];
  let currentToken = '';

  for (let i = 0; i < expression.length; i++) {
    const char = expression[i]!;

    if (/\s/.test(char)) { // Skip whitespace
      if (currentToken) { // End of a number token before whitespace
        tokens.push(currentToken);
        currentToken = '';
      }
      continue;
    }

    if (/\d/.test(char) || (char === '.' && /\d/.test(expression[i+1]!))) { // Part of a number
      currentToken += char;
    } else if (isOperator(char) || char === '(' || char === ')') { // Operator or parenthesis
      if (currentToken) { // End of a number token
        tokens.push(currentToken);
        currentToken = '';
      }
      tokens.push(char); // Add operator/parenthesis
    } else { // Potentially part of a multi-character operand (variable name)
        // For this version, we'll stick to digits and known operators for simplicity in operands
        // If it's not a digit, operator, or parenthesis, and not whitespace, it's an error for now
        // or assume single letter operands if not grouping them.
        // Let's assume for now that if it's not a digit, it might be a single letter operand if currentToken is empty.
        if (/[a-zA-Z]/.test(char)) {
             if (currentToken && !/\d/.test(currentToken)) { // append to existing char operand
                currentToken += char;
             } else if (currentToken) { // was a number, push it
                tokens.push(currentToken);
                currentToken = char; // start new char operand
             }
             else {
                currentToken = char;
             }
        } else {
            throw new Error(`Invalid character in expression: ${char}`);
        }
    }
  }

  if (currentToken) { // Add any trailing token
    tokens.push(currentToken);
  }
  return tokens;
};

// Tokenizer for prefix/postfix expressions (tokens are space-separated)
const tokenizePrefixPostfix = (expression: string): string[] => {
  return expression.trim().split(/\s+/).filter(token => token.length > 0);
};

const isOperand = (token: string): boolean => {
  // An operand is not an operator and not a parenthesis.
  // It can be a number (e.g., "123") or a variable (e.g., "abc").
  return !isOperator(token) && token !== '(' && token !== ')';
};


export const infixToPostfix = (infix: string): string => {
  if (!infix.trim()) return "";
  const tokens = tokenizeInfix(infix);
  const stack: string[] = [];
  const postfixTokens: string[] = [];

  for (const token of tokens) {
    if (isOperand(token)) {
      postfixTokens.push(token);
    } else if (token === '(') {
      stack.push(token);
    } else if (token === ')') {
      while (stack.length > 0 && stack[stack.length - 1] !== '(') {
        postfixTokens.push(stack.pop()!);
      }
      if (stack.length === 0 || stack[stack.length - 1] !== '(') {
        throw new Error("Mismatched parentheses: Unexpected ')' or missing '('");
      }
      stack.pop(); // Pop '('
    } else if (isOperator(token)) {
      while (
        stack.length > 0 &&
        stack[stack.length - 1] !== '(' &&
        getPrecedence(stack[stack.length - 1]!) >= getPrecedence(token)
      ) {
        postfixTokens.push(stack.pop()!);
      }
      stack.push(token);
    } else {
      // This case should ideally not be reached if tokenizer and isOperand are correct
      throw new Error(`Invalid token in expression: ${token}`);
    }
  }

  while (stack.length > 0) {
    if (stack[stack.length - 1] === '(') {
      throw new Error("Mismatched parentheses: Unclosed '('");
    }
    postfixTokens.push(stack.pop()!);
  }
  return postfixTokens.join(' ');
};

export const infixToPrefix = (infix: string): string => {
  if (!infix.trim()) return "";
  let tokens = tokenizeInfix(infix);

  // Reverse tokens
  tokens.reverse();

  // Swap parentheses
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === '(') {
      tokens[i] = ')';
    } else if (tokens[i] === ')') {
      tokens[i] = '(';
    }
  }

  // Convert reversed infix to "postfix-like"
  const stack: string[] = [];
  const tempPrefixTokens: string[] = [];

  for (const token of tokens) {
    if (isOperand(token)) {
      tempPrefixTokens.push(token);
    } else if (token === '(') {
      stack.push(token);
    } else if (token === ')') {
      while (stack.length > 0 && stack[stack.length - 1] !== '(') {
        tempPrefixTokens.push(stack.pop()!);
      }
      if (stack.length === 0 || stack[stack.length - 1] !== '(') {
        throw new Error("Mismatched parentheses: Unexpected '(' or missing ')' in reversed expression");
      }
      stack.pop(); // Pop '('
    } else if (isOperator(token)) {
      // For prefix, when an operator has same precedence as stack top, we should process stack top first.
      // However, the standard Shunting-Yard for postfix (left-associative) handles '>' or '>='.
      // For right-to-left (prefix), for same precedence, we need to stack the current op.
      // So, we pop only if stack top has strictly HIGHER precedence.
      while (
        stack.length > 0 &&
        stack[stack.length - 1] !== '(' &&
        getPrecedence(stack[stack.length - 1]!) > getPrecedence(token) // Strictly greater for prefix
      ) {
        tempPrefixTokens.push(stack.pop()!);
      }
      stack.push(token);
    }
  }

  while (stack.length > 0) {
    if (stack[stack.length - 1] === '(') {
      throw new Error("Mismatched parentheses: Unclosed ')' in reversed expression");
    }
    tempPrefixTokens.push(stack.pop()!);
  }

  return tempPrefixTokens.reverse().join(' ');
};


export const prefixToInfix = (prefix: string): string => {
  if (!prefix.trim()) return "";
  const tokens = tokenizePrefixPostfix(prefix).reverse(); // Process from right to left
  const stack: string[] = [];

  for (const token of tokens) {
    if (isOperand(token)) {
      stack.push(token);
    } else if (isOperator(token)) {
      if (stack.length < 2) {
        throw new Error("Invalid prefix expression: Operator found without enough subsequent operands. Ensure operators are followed by two operands or valid sub-expressions.");
      }
      const op1 = stack.pop()!;
      const op2 = stack.pop()!;
      // For prefix, the first popped (op1) is the left operand in infix
      stack.push(`(${op1} ${token} ${op2})`);
    } else {
      throw new Error(`Invalid token in prefix expression: ${token}`);
    }
  }

  if (stack.length !== 1) {
    throw new Error("Invalid prefix expression format: The expression structure is incorrect. This often means an imbalance of operands and operators, or it's not valid prefix notation.");
  }
  return stack[0]!;
};

export const postfixToInfix = (postfix: string): string => {
  if (!postfix.trim()) return "";
  const tokens = tokenizePrefixPostfix(postfix);
  const stack: string[] = [];

  for (const token of tokens) {
    if (isOperand(token)) {
      stack.push(token);
    } else if (isOperator(token)) {
      if (stack.length < 2) {
        throw new Error("Invalid postfix expression: Operator found without enough preceding operands. Ensure operators have two preceding operands.");
      }
      const op2 = stack.pop()!; // Second operand
      const op1 = stack.pop()!; // First operand
      stack.push(`(${op1} ${token} ${op2})`);
    } else {
      throw new Error(`Invalid token in postfix expression: ${token}`);
    }
  }
  if (stack.length !== 1) {
    throw new Error("Invalid postfix expression format: The expression structure is incorrect. This often means an imbalance of operands and operators, or it's not valid postfix notation.");
  }
  return stack[0]!;
};

export const prefixToPostfix = (prefix: string): string => {
  if (!prefix.trim()) return "";
  const infix = prefixToInfix(prefix);
  // The infix expression from prefixToInfix might have extra spaces or be un-tokenized for infixToPostfix
  // So, we let infixToPostfix re-tokenize it.
  return infixToPostfix(infix);
};

export const postfixToPrefix = (postfix: string): string => {
  if (!postfix.trim()) return "";
  const infix = postfixToInfix(postfix);
  // Similar to prefixToPostfix, let infixToPrefix re-tokenize.
  return infixToPrefix(infix);
};
