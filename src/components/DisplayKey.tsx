import { Tooltip, Typography } from 'antd';

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
      <Tooltip title="Exchange Account">
        <Typography.Text code style={{ marginRight: '3px' }}>
          {ExplorerLink({ publicKey, displayKey })}
        </Typography.Text>
      </Tooltip>

      {authority && (
        <Tooltip title="Authority Account">
          <ExplorerLink publicKey={authority} displayKey="🔑"></ExplorerLink>
        </Tooltip>
      )}
    </>
  );
}
function ExplorerLink({
  publicKey,
  displayKey,
}: {
  publicKey: string;
  displayKey: string;
}) {
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
