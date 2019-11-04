import React, { useState, FunctionComponent } from 'react';
import App from 'next/app';

const Layout: FunctionComponent = function({ children }) {
  const [state, setstate] = useState(1);
  return (
    <div className="layout">
      <h2>{state}</h2>
      <button onClick={() => setstate(state + 1)}>count</button>
      <hr />
      {children}
    </div>
  );
};

export default class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <Layout>
        <Component {...pageProps} />
      </Layout>
    );
  }
}
