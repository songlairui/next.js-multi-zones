import React, { useState, FunctionComponent } from 'react';
import App from 'next/app';

const Layout: FunctionComponent = function({ children }) {
  const [state, setstate] = useState('StateA');
  return (
    <div className="layout">
      <h1 onClick={() => setstate(`${state}-`)}>{state}</h1>
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
