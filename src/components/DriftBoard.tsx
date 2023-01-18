import { doc } from 'firebase/firestore';
import { useFirestore, useFirestoreDoc, useFirestoreDocData } from 'reactfire';
import { Card, Col, Row, Space, Statistic, Table } from 'antd';
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
  activeAccounts: number;
}

function DriftStats() {
  const firestore = useFirestore();
  const driftStatsRef = doc(firestore, 'zetaAccountHealth', 'drift_stats');

  const { status, data } = useFirestoreDocData(driftStatsRef);
  const loading = status === 'loading';

  const stats = data?.stats || {};

  const statList = [
    ['Total Deposits', displayDollars(stats.totalCollateral) || 0],
    ['Open Interest', displayDollars(stats.oi) || 0],
    ['Active Accounts', stats.activeAccounts || 0],
  ];

  const statCards = statList.map(([title, value]) => (
    <Col span={8} key={`drift-stats-${title}`}>
      <Card bordered={true}>
        <Statistic
          title={title}
          value={value}
          precision={0}
          loading={loading}
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
      render: (key: string) => <DisplayKey publicKey={key}></DisplayKey>,
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
      title: 'uPnL',
      dataIndex: 'upnl',
      key: 'upnl',
      align: 'right',
      responsive: ['lg'],
      render: (pnl: number) => <DisplayPnL pnl={pnl}></DisplayPnL>,
    },
    {
      title: 'Health',
      dataIndex: 'health',
      key: 'health',
      render: (health: number) => <HealthBar health={health / 100}></HealthBar>,
    },
    {
      title: 'Market',
      dataIndex: 'positions',
      key: 'positions',
      align: 'center',
      render: (positions: DriftAccountHealth['positions']) =>
        positions.map((pos) => (
          <AssetTag asset={pos.asset} side={pos.side}></AssetTag>
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
