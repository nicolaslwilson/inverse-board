import { Col, Row, Typography } from 'antd';

export function TitleRow({
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
