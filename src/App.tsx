import React from 'react';
import './App.css';
import { getFirestore } from 'firebase/firestore';
import { FirestoreProvider, useFirebaseApp } from 'reactfire';
import { Layout, theme, Typography } from 'antd';
import { ZetaBoard } from './components/ZetaBoard';

const { Header, Footer, Content } = Layout;

function App() {
  const app = useFirebaseApp();
  const firestore = getFirestore(app);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  return (
    <FirestoreProvider sdk={firestore}>
      <Layout style={{ height: '100vh' }}>
        <Header>
          <h1 className="title"> 🐸 Inverse Board</h1>
        </Header>
        <Content style={{ padding: '50px 50px' }}>
          <div
            className="site-layout-content"
            // style={{ background: colorBgContainer }}
          >
            <ZetaBoard></ZetaBoard>
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
