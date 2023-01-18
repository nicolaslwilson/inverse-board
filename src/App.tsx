import React, { useState } from 'react';
import './App.css';
import { getFirestore } from 'firebase/firestore';
import { FirestoreProvider, useFirebaseApp } from 'reactfire';
import { Layout, Menu, MenuProps, theme, Typography } from 'antd';
import { ZetaBoard } from './components/ZetaBoard';
import { DriftBoard } from './components/DriftBoard';

const { Header, Footer, Content } = Layout;
const items: MenuProps['items'] = [
  {
    label: 'Zeta',
    key: 'zeta',
  },
  {
    label: 'Drift',
    key: 'drift',
  },
];

function App() {
  const app = useFirebaseApp();
  const firestore = getFirestore(app);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const [current, setCurrent] = useState('zeta');

  const onClick: MenuProps['onClick'] = (e) => {
    setCurrent(e.key);
  };

  return (
    <FirestoreProvider sdk={firestore}>
      <Layout>
        <Header>
          <div>
            <h1 className="title">🐸 Inverse Board</h1>
            <Menu
              className="nav"
              theme="dark"
              onClick={onClick}
              selectedKeys={[current]}
              mode="horizontal"
              items={items}
            />
          </div>
        </Header>
        <Content className="content">
          <div
            className="site-layout-content"
            // style={{ background: colorBgContainer }}
          >
            {
              {
                drift: <DriftBoard></DriftBoard>,
                zeta: <ZetaBoard></ZetaBoard>,
              }[current]
            }
            {/* <DriftBoard></DriftBoard>
            <ZetaBoard></ZetaBoard> */}
          </div>
        </Content>
        <Footer style={{ textAlign: 'right' }}>
          🐦 &nbsp;
          <a href="https://twitter.com/_hahaworld">@_hahaworld</a>
        </Footer>
      </Layout>
    </FirestoreProvider>
  );
}

export default App;
