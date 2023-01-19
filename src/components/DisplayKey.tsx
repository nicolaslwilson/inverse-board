import { Typography } from 'antd';

export function DisplayKey({
  publicKey,
  authority,
}: {
  publicKey: string;
  authority?: string;
}) {
  const displayKey = publicKey.slice(0, 4).concat('...', publicKey.slice(-4));
  return (
    <>
      <Typography.Text code style={{ marginRight: '3px' }}>
        {ExplorerLink(publicKey, displayKey)}
      </Typography.Text>
      {authority && ExplorerLink(authority, '🔑')}
    </>
  );
}
function ExplorerLink(publicKey: string, displayKey: string) {
  return (
    <a
      href={`https://explorer.solana.com/address/${publicKey}`}
      target="_blank"
      rel="noreferrer"
    >
      {displayKey}
    </a>
  );
}

