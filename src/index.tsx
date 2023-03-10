import React from 'react';
import ReactDOM from 'react-dom/client';
import "antd/dist/reset.css";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { FirebaseAppProvider } from "reactfire";
import { ConfigProvider, theme } from 'antd';

const firebaseConfig = {
  apiKey: 'AIzaSyBs0sl1WEwRAIdMLQ6QXAMjjNrvC4n-jh4',
  authDomain: 'mm-liquid.firebaseapp.com',
  projectId: 'mm-liquid',
  storageBucket: 'mm-liquid.appspot.com',
  messagingSenderId: '102063149507',
  appId: '1:102063149507:web:297a84a2627850221f6d76',
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <ConfigProvider
        theme={{
          algorithm: theme.compactAlgorithm,
        }}
      >
        <App />
      </ConfigProvider>
    </FirebaseAppProvider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
