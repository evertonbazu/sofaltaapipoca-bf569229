
import React, { useState, ChangeEvent, FocusEvent } from 'react';
import { Input } from '@/components/ui/input';

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const CurrencyInput = ({ value, onChange, placeholder = "R$ 0,00", className }: CurrencyInputProps) => {
  const [displayValue, setDisplayValue] = useState<string>(() => {
    // Initialize with formatted value if provided
    if (value && value.trim() !== "") {
      return value;
    }
    return "R$ ";
  });

  const formatCurrency = (value: string): string => {
    // Remove any non-digit characters
    let numericValue = value.replace(/[^\d]/g, '');
    
    // Handle empty input
    if (!numericValue) {
      return "R$ ";
    }

    // Convert to decimal (divide by 100 to get reais and centavos)
    const floatValue = parseInt(numericValue, 10) / 100;
    
    // Format the number to Brazilian currency
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(floatValue);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Set display value to formatted currency
    const formattedValue = formatCurrency(inputValue.replace(/[^\d]/g, ''));
    setDisplayValue(formattedValue);
    
    // Pass the formatted value to parent component
    onChange(formattedValue);
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    // If there's only "R$ " when focused, place cursor at the end
    if (displayValue === "R$ ") {
      e.target.setSelectionRange(3, 3);
    }
  };

  return (
    <Input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      placeholder={placeholder}
      className={className}
    />
  );
};

export default CurrencyInput;
