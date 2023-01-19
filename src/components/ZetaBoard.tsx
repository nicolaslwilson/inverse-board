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

interface ZetaAccountHealthData {
  publicKey: string;
  health: number;
  balance: number;
  margin: number;
  authority: string;
}
export function ZetaBoard() {
  const firestore = useFirestore();
  const zetaAccountRef = doc(firestore, 'zetaAccountHealth', 'accounts');

  const { status, data } = useFirestoreDoc(zetaAccountRef);

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
        title="Zeta Exchange Stats"
        lastUpdatedAt={lastUpdatedAt}
      ></TitleRow>
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <ZetaStats />
        <ZetaTable accounts={accounts} />
      </Space>
    </div>
  );
}

type ZetaExchangeStats = {
  totalBalance: number;
  totalMaintenance: number;
  totalAccounts: number;
};

function ZetaStats() {
  const firestore = useFirestore();
  const zetaStatsRef = doc(firestore, 'zetaAccountHealth', 'stats');

  const { status, data } = useFirestoreDocData(zetaStatsRef);
  const loading = status === 'loading';

  const stats = data?.stats || {};

  const statList = [
    ['Total Deposits', displayDollars(stats.totalBalance) || 0],
    ['Open Interest', displayDollars(stats.totalMaintenance / 0.065 / 2) || 0],
    ['Active Accounts', stats.totalAccounts || 0],
  ];

  const statCards = statList.map(([title, value]) => (
    <Col key={`stats-${title}`} xs={24} sm={8}>
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

  return <Row gutter={{ xs: 8, sm: 8, md: 12, lg: 16 }}>{statCards}</Row>;
}

function ZetaTable({ accounts }: { accounts: ZetaAccountHealthData[] }) {
  const columns: ColumnsType<ZetaAccountHealthData> = [
    {
      title: 'Account',
      dataIndex: 'publicKey',
      key: 'publicKey',
      render: (key: string, record) => (
        <DisplayKey publicKey={key} authority={record.authority}></DisplayKey>
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
      title: 'uPnL',
      dataIndex: 'upnl',
      key: 'upnl',
      align: 'right',
      render: (upnl: number) => <DisplayPnL pnl={upnl}></DisplayPnL>,
      responsive: ['lg'],
    },
    {
      title: 'Health',
      dataIndex: 'health',
      align: 'center',
      key: 'health',
      render: (health: number) => <HealthBar health={health}></HealthBar>,
    },
    {
      title: 'Market',
      dataIndex: 'asset',
      key: 'asset',
      align: 'center',
      responsive: ['sm'],
      render: (asset: string) => <AssetTag asset={asset}></AssetTag>,
    },
  ];
  return (
    <Table
      columns={columns}
      dataSource={accounts as ZetaAccountHealthData[]}
      rowKey="publicKey"
      pagination={false}
    ></Table>
  );
}
