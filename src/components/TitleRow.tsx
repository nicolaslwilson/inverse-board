import { SyncOutlined } from '@ant-design/icons';
import { Col, Row, Typography } from 'antd';
import { useEffect, useState } from 'react';

export function TitleRow({
  title,
  lastUpdatedAt,
}: {
  title: string;
  lastUpdatedAt: string;
}) {
  const [spin, setSpin] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setSpin(false), 1200);
    return () => clearTimeout(timer);
  });
  return (
    <Row align="bottom" justify="space-between">
      <Col>
        <Typography.Title level={3}>{title}</Typography.Title>
      </Col>
      <Col>
        <Typography.Title level={5} type="secondary">
          Last updated: {lastUpdatedAt} &nbsp;
          <SyncOutlined style={{ color: 'blue' }} spin={spin} />
        </Typography.Title>
      </Col>
    </Row>
  );
}
