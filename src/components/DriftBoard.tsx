import { doc } from 'firebase/firestore';
import { useFirestore, useFirestoreDoc, useFirestoreDocData } from 'reactfire';
import { Card, Col, Row, Space, Statistic, Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { displayDollars } from '../utils/displayDollars';
import { HealthBar } from './HealthBar';
import { DisplayPnL } from './DisplayPnL';
import { DisplayKey } from './DisplayKey';
import { TitleRow } from './TitleRow';
import { AssetTag } from './AssetTag';

interface DriftAccountHealth {
  publicKey: string;
  authority: string;
  collateral: number;
  health: number;
  positions: { asset: string; side: string }[];
  pnl: number;
}

export function DriftBoard() {
  const firestore = useFirestore();
  const driftAccountsRef = doc(
    firestore,
    'zetaAccountHealth',
    'drift_accounts',
  );

  const { status, data } = useFirestoreDoc(driftAccountsRef);

  // const { status, data:  } = (accountQuery, {
  //   idField: 'id',
  // });

  let accounts = [];
  let lastUpdatedAt = '';

  if (status === 'success') {
    const snapshot = data.data();
    accounts = snapshot?.accounts;
    lastUpdatedAt = new Date(
      snapshot?.updatedAt.seconds * 1000,
    ).toLocaleString();
  }

  return (
    <div>
      <TitleRow
        title="Drift Exchange Stats"
        lastUpdatedAt={lastUpdatedAt}
        key={lastUpdatedAt}
      ></TitleRow>
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <DriftStats />
        <DriftTable accounts={accounts} />
      </Space>
    </div>
  );
}

interface DriftExchangeStats {
  totalCollateral: number;
  oi: number;
  oiBySide: {
    SOL: {
      long: number;
      short: number;
    };
    ETH: {
      long: number;
      short: number;
    };
    BTC: {
      long: number;
      short: number;
    };
  };
  activeAccounts: number;
}

function DriftStats() {
  const firestore = useFirestore();
  const driftStatsRef = doc(firestore, 'zetaAccountHealth', 'drift_stats');

  const { status, data } = useFirestoreDocData(driftStatsRef);
  const loading = status === 'loading';

  let statList = Array(4);

  const stats: DriftExchangeStats = data?.stats || {};
  let longOi = 0;
  let shortOi = 0;

  if (!loading) {
    const oiBySide: DriftExchangeStats['oiBySide'] = stats.oiBySide;

    Object.values(oiBySide).forEach((market) => {
      longOi += market.long;
      shortOi += market.short;
    });
  }

  statList = [
    ['Total Deposits', displayDollars(stats.totalCollateral) || 0],
    [
      'Long Open Interest',
      displayDollars(longOi),
      { valueStyle: { color: 'green' } },
    ],
    [
      'Short Open Interest',
      displayDollars(shortOi),
      { valueStyle: { color: 'red' } },
    ],
    ['Active Accounts', stats.activeAccounts || 0],
  ];

  const statCards = statList.map(([title, value, extra]) => (
    <Col
      key={`drift-stats-${title}`}
      xs={24}
      sm={12}
      md={6}
      className="drift-stat"
    >
      <Card bordered={true}>
        <Statistic
          title={title}
          value={value}
          precision={0}
          loading={loading}
          {...(extra || {})}
        />
      </Card>
    </Col>
  ));

  return <Row gutter={16}>{statCards}</Row>;
}

function DriftTable({ accounts }: { accounts: DriftAccountHealth[] }) {
  const columns: ColumnsType<DriftAccountHealth> = [
    {
      title: 'Account',
      dataIndex: 'publicKey',
      key: 'publicKey',
      render: (key: string, row) => (
        <DisplayKey
          publicKey={key}
          authority={row.authority}
          exchange="drift"
        ></DisplayKey>
      ),
    },

    {
      title: 'Collateral',
      dataIndex: 'collateral',
      key: 'collateral',
      align: 'right',
      render: (balance: number) => <span>{displayDollars(balance)}</span>,
    },
    // {
    //   title: 'Margin',
    //   dataIndex: 'margin',
    //   key: 'margin',
    //   align: 'right',
    //   render: (margin: number) => <span>{displayDollars(margin)}</span>,
    // },
    {
      title: () => (
        <Tooltip title="PnL of Open Positions. Collateral amount will reflect any previously settled PnL">
          PnL
        </Tooltip>
      ),
      dataIndex: 'pnl',
      key: 'pnl',
      align: 'right',
      responsive: ['lg'],
      render: (pnl: number) => <DisplayPnL pnl={pnl}></DisplayPnL>,
    },
    {
      title: 'Health',
      dataIndex: 'health',
      align: 'center',
      key: 'health',
      render: (health: number) => <HealthBar health={health / 100}></HealthBar>,
    },
    {
      title: 'Positions',
      dataIndex: 'positions',
      key: 'positions',
      align: 'center',
      render: (positions: DriftAccountHealth['positions']) =>
        positions
          .filter((pos) => !(pos.asset === 'USDC' && pos.side === 'long'))
          .map((pos) => (
            <AssetTag
              key={pos.asset}
              asset={pos.asset}
              side={pos.side}
            ></AssetTag>
          )),
    },
  ];
  return (
    <Table
      columns={columns}
      dataSource={accounts as DriftAccountHealth[]}
      rowKey="publicKey"
      pagination={false}
    ></Table>
  );
}
