import { Tag } from 'antd';

export function AssetTag({ asset, side }: { asset: string; side?: string }) {
  let color = 'default';
  switch (side || asset.toLowerCase()) {
    case 'sol':
      color = 'purple';
      break;
    case 'btc':
      color = 'gold';
      break;
    case 'eth':
      color = 'blue';
      break;
    case 'long':
      color = 'green';
      break;
    case 'short':
      color = 'red';
      break;
  }
  return <Tag color={color}>{asset.toUpperCase()}</Tag>;
}
