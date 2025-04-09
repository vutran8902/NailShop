"use client";

import React from "react";

export function DatePicker({
  value,
  onChange,
  className
}: {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <input
        type="date"
        value={value.toISOString().split('T')[0]}
        onChange={(e) => onChange(new Date(e.target.value))}
        className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white/30 dark:bg-purple-900/30 backdrop-blur-lg"
      />
    </div>
  );
}
