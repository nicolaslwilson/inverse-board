import React from "react";
import logo from "./logo.svg";
import "./App.css";
import {
  collection,
  doc,
  getFirestore,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import {
  FirestoreProvider,
  useFirestoreDocData,
  useFirestore,
  useFirebaseApp,
  useFirestoreCollectionData,
} from "reactfire";
import { Layout, List } from "antd";

const { Header, Footer, Content } = Layout;

function ZetaBoard() {
  const firestore = useFirestore();
  const zetaCollection = collection(firestore, "zetaAccountHealth");
  const accountQuery = query(
    zetaCollection,
    orderBy("health", "asc"),
    limit(10)
  );
  const { status, data: accounts } = useFirestoreCollectionData(accountQuery, {
    idField: "id",
  });

  if (status === "loading") {
    return <span>loading...</span>;
  }

  console.log(accounts);
  return (
    <List
      bordered
      dataSource={accounts}
      renderItem={(account) => (
        <List.Item>
          {account.publicKey} {account.health}
        </List.Item>
      )}
    />
  );
}

function App() {
  const app = useFirebaseApp();
  const firestore = getFirestore(app);
  return (
    <FirestoreProvider sdk={firestore}>
      <Header>🐸 Inverse Board</Header>
      <Content>
        <ZetaBoard></ZetaBoard>
      </Content>
      <Footer></Footer>
    </FirestoreProvider>
  );
}

export default App;
