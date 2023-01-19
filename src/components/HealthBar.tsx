import { Progress } from 'antd';
import React from 'react';
import { getColorForHealth } from '../utils/gradient';
import { useViewport } from '../utils/useViewport';

export function HealthBar({ health }: { health: number }) {
  const { width } = useViewport();

  const breakpoint = 520;

  const healthPercent = health * 100;
  return (
    <Progress
      percent={Math.round(healthPercent * 100) / 100}
      strokeColor={getColorForHealth(health)}
      size="small"
      type={width > breakpoint ? 'line' : 'circle'}
      width={20}
      style={{ width: '95%' }}
    ></Progress>
  );
}
