import { Progress } from 'antd';
import { getColorForHealth } from '../utils/gradient';

export function HealthBar({ health }: { health: number }) {
  const healthPercent = health * 100;
  return (
    <div>
      <Progress
        percent={Math.round(healthPercent * 100) / 100}
        strokeColor={getColorForHealth(health)}
        size="small"
        style={{ width: '98%' }}
      ></Progress>
    </div>
  );
}
