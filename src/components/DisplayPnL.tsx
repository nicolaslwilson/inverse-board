import { Typography } from 'antd';
import { displayDollars } from '../utils/displayDollars';

export function DisplayPnL({ pnl }: { pnl: number }) {
  const type = pnl > 0 ? 'success' : 'danger';
  return <Typography.Text type={type}>{displayDollars(pnl)}</Typography.Text>;
}
