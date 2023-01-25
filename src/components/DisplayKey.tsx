import { Tooltip, Typography } from 'antd';

export function DisplayKey({
  publicKey,
  authority,
  exchange,
}: {
  publicKey: string;
  authority?: string;
  exchange?: 'drift';
}) {
  const displayKey = publicKey.slice(0, 4).concat('...', publicKey.slice(-4));
  const driftLink = `https://app.drift.trade/?authority=`;
  return (
    <>
      <Tooltip title="Exchange Account">
        <Typography.Text code style={{ marginRight: '3px' }}>
          {Link({ publicKey, displayKey })}
        </Typography.Text>
      </Tooltip>

      {authority && (
        <Tooltip title="Authority Account">
          <Link
            publicKey={authority}
            displayKey="🔑"
            base={exchange === 'drift' ? driftLink : undefined}
          ></Link>
        </Tooltip>
      )}
    </>
  );
}
function Link({
  publicKey,
  displayKey,
  base = 'https://explorer.solana.com/address/',
}: {
  publicKey: string;
  displayKey: string;
  base?: string;
}) {
  return (
    <a href={`${base}${publicKey}`} target="_blank" rel="noreferrer">
      {displayKey}
    </a>
  );
}
