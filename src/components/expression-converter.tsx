
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';
import {
  infixToPostfix,
  infixToPrefix,
  prefixToPostfix,
  postfixToPrefix,
} from '@/lib/conversion';

type ConversionType =
  | 'infix-to-prefix'
  | 'infix-to-postfix'
  | 'prefix-to-postfix'
  | 'postfix-to-prefix';

const conversionOptions: { value: ConversionType; label: string }[] = [
  { value: 'infix-to-postfix', label: 'Infix to Postfix' },
  { value: 'infix-to-prefix', label: 'Infix to Prefix' },
  { value: 'prefix-to-postfix', label: 'Prefix to Postfix' },
  { value: 'postfix-to-prefix', label: 'Postfix to Prefix' },
];

const ExpressionConverter: FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [outputValue, setOutputValue] = useState<string>('');
  const [conversionType, setConversionType] = useState<ConversionType>(conversionOptions[0]!.value);
  const [error, setError] = useState<string | null>(null);
  const [showOutput, setShowOutput] = useState<boolean>(false);

  const handleConvert = () => {
    setError(null);
    setOutputValue('');
    setShowOutput(false);

    if (!inputValue.trim()) {
      setError("Input expression cannot be empty.");
      return;
    }

    try {
      let result = '';
      switch (conversionType) {
        case 'infix-to-postfix':
          result = infixToPostfix(inputValue);
          break;
        case 'infix-to-prefix':
          result = infixToPrefix(inputValue);
          break;
        case 'prefix-to-postfix':
          result = prefixToPostfix(inputValue);
          break;
        case 'postfix-to-prefix':
          result = postfixToPrefix(inputValue);
          break;
        default:
          throw new Error('Invalid conversion type selected.');
      }
      setOutputValue(result);
      if (result) { // Only show output card if there's a result
        setShowOutput(true);
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred during conversion.');
      }
    }
  };
  
  // Effect to trigger animation when outputValue is set
  useEffect(() => {
    if (outputValue) {
      setShowOutput(true);
    } else {
      // If output becomes empty (e.g. input cleared), hide the output card
      setShowOutput(false);
    }
  }, [outputValue]);


  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-[hsl(var(--mahdi-brand-color))]">Mahdi Cheraghi</h1>

      {error && (
        <Alert variant="destructive" className="mb-6 w-full max-w-lg animate-in fade-in-0 duration-300">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="w-full max-w-lg mb-8 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Input Expression</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="conversionType" className="text-sm font-medium">Conversion Type</Label>
            <Select
              value={conversionType}
              onValueChange={(value) => setConversionType(value as ConversionType)}
            >
              <SelectTrigger id="conversionType" className="w-full font-mono">
                <SelectValue placeholder="Select conversion type" />
              </SelectTrigger>
              <SelectContent>
                {conversionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="font-mono">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="inputExpression" className="text-sm font-medium">Expression</Label>
            <Textarea
              id="inputExpression"
              placeholder="Enter expression (e.g., a+b*c)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="font-mono min-h-[100px] text-base focus:ring-accent focus:border-accent"
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleConvert} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            Convert
          </Button>
        </CardFooter>
      </Card>

      {showOutput && (
         <Card className="w-full max-w-lg shadow-xl animate-in fade-in-0 zoom-in-95 duration-500">
          <CardHeader>
            <CardTitle className="text-2xl">Converted Expression</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="outputExpression"
              value={outputValue}
              readOnly
              className="font-mono min-h-[100px] text-base bg-muted/50 border-muted"
              rows={3}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExpressionConverter;
