import { SmileOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import { useState } from 'react';

export function About() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        shape="round"
        icon={<SmileOutlined rotate={180} />}
        onClick={showModal}
      >
        Info
      </Button>
      <Modal
        title="About"
        open={isModalOpen}
        onOk={handleOk}
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <p>
          Inverse Board displays near realtime data on accounts nearest
          liquidation on Solana defi protocols. It was built at the Solana
          Chicago Bootcamp in January 2023.
        </p>
        <p>
          Follow me on Twitter
          <a href="https://twitter.com/_hahaworld">@_hahaworld</a>
        </p>
      </Modal>
    </>
  );
}
