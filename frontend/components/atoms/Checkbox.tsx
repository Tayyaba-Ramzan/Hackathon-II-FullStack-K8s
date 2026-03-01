import React from 'react';

interface CheckboxProps {
  id: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export default function Checkbox({
  id,
  name,
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}: CheckboxProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="h-4 w-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-white transition-colors duration-200"
        aria-checked={checked}
      />
      {label && (
        <label
          htmlFor={id}
          className="ml-2 block text-sm text-gray-900 cursor-pointer"
        >
          {label}
        </label>
      )}
    </div>
  );
}
