import { collection, doc, limit, orderBy, query } from 'firebase/firestore';
import {
  useFirestore,
  useFirestoreCollectionData,
  useFirestoreDoc,
  useFirestoreDocData,
} from 'reactfire';
import {
  Card,
  Col,
  List,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import { getColorForHealth } from '../utils/gradient';
import SkeletonInput from 'antd/es/skeleton/Input';
import { displayDollars } from '../utils/displayDollars';

interface ZetaAccountHealthData {
  publicKey: string;
  health: number;
  balance: number;
  margin: number;
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

  console.log({ status, data });
  if (status === 'success') {
    const snapshot = data.data();
    console.log(snapshot);
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
    ['Total Margin', displayDollars(stats.totalMaintenance) || 0],
    ['Total Accounts', stats.totalAccounts || 0],
  ];

  const statCards = statList.map(([title, value]) => (
    <Col span={8}>
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

function ZetaTable({ accounts }: { accounts: ZetaAccountHealthData[] }) {
  const columns: ColumnsType<ZetaAccountHealthData> = [
    {
      title: 'Account',
      dataIndex: 'publicKey',
      key: 'publicKey',
      render: (key: string) => <DisplayKey publicKey={key}></DisplayKey>,
    },
    {
      title: 'Health',
      dataIndex: 'health',
      key: 'health',
      render: (health: number) => <HealthBar health={health}></HealthBar>,
    },
    {
      title: 'Net Balance',
      dataIndex: 'balance',
      key: 'balance',
      align: 'right',
      render: (balance: number) => <span>{displayDollars(balance)}</span>,
    },
    {
      title: 'Margin',
      dataIndex: 'margin',
      key: 'margin',
      align: 'right',
      render: (margin: number) => <span>{displayDollars(margin)}</span>,
    },
    {
      title: 'uPnL',
      dataIndex: 'upnl',
      key: 'upnl',
      align: 'right',
      render: (upnl: number) => <DisplayPnL pnl={upnl}></DisplayPnL>,
    },
    {
      title: 'Market',
      dataIndex: 'asset',
      key: 'asset',
      align: 'center',
      render: (asset: string) => <AssetTag asset={asset}></AssetTag>,
    },
  ];
  return (
    <Table
      columns={columns}
      dataSource={accounts as ZetaAccountHealthData[]}
      pagination={false}
    ></Table>
  );
}

function AssetTag({ asset }: { asset: string }) {
  let color = 'default';
  switch (asset) {
    case 'sol':
      color = 'purple';
      break;
    case 'btc':
      color = 'gold';
      break;
    case 'eth':
      color = 'blue';
      break;
  }
  return <Tag color={color}>{asset.toUpperCase()}</Tag>;
}

function TitleRow({
  title,
  lastUpdatedAt,
}: {
  title: string;
  lastUpdatedAt: string;
}) {
  return (
    <Row align="bottom" justify="space-between">
      <Col>
        <Typography.Title level={3}>{title}</Typography.Title>
      </Col>
      <Col>
        <Typography.Title level={5} type="secondary">
          Last updated: {lastUpdatedAt}
        </Typography.Title>
      </Col>
    </Row>
  );
}

function DisplayPnL({ pnl }: { pnl: number }) {
  const type = pnl > 0 ? 'success' : 'danger';
  return <Typography.Text type={type}>{displayDollars(pnl)}</Typography.Text>;
}

function DisplayKey({ publicKey }: { publicKey: string }) {
  const displayKey = publicKey.slice(0, 4).concat('...', publicKey.slice(-4));
  return <Typography.Text strong>{displayKey}</Typography.Text>;
}

function HealthBar({ health }: { health: number }) {
  const healthPercent = health * 100;
  return (
    <Progress
      percent={Math.round(healthPercent * 100) / 100}
      strokeColor={getColorForHealth(health)}
      size="small"
    ></Progress>
  );
}
