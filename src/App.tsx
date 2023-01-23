import React, { useState } from 'react';
import './App.css';
import { getFirestore } from 'firebase/firestore';
import { FirestoreProvider, useFirebaseApp } from 'reactfire';
import { Layout, Menu, MenuProps, theme, Typography } from 'antd';
import { ZetaBoard } from './components/ZetaBoard';
import { DriftBoard } from './components/DriftBoard';
import { About } from './components/About';
import { useViewport } from './utils/useViewport';

const { Header, Footer, Content } = Layout;
const items: MenuProps['items'] = [
  {
    label: 'Drift',
    key: 'drift',
  },
  {
    label: 'Zeta',
    key: 'zeta',
  },
];

function App() {
  const app = useFirebaseApp();
  const firestore = getFirestore(app);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const [current, setCurrent] = useState('drift');

  const onClick: MenuProps['onClick'] = (e) => {
    setCurrent(e.key);
  };

  return (
    <FirestoreProvider sdk={firestore}>
      <Layout>
        <Header>
          <div>
            {Title()}
            <Menu
              className="nav"
              theme="dark"
              onClick={onClick}
              selectedKeys={[current]}
              mode="horizontal"
              items={items}
            />
            <div className="info">
              <About></About>
            </div>
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
function Title() {
  const { width } = useViewport();
  const breakpoint = 380;
  return (
    <h1 className="title">🐸 {width > breakpoint ? `Inverse Board` : ''}</h1>
  );
}

