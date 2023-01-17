import React from 'react';

export function displayDollars(margin: number): React.ReactNode {
  return Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(margin);
}
