import { Typography } from 'antd';

export function DisplayKey({ publicKey }: { publicKey: string }) {
  const displayKey = publicKey.slice(0, 4).concat('...', publicKey.slice(-4));
  return <Typography.Text strong>{displayKey}</Typography.Text>;
}
