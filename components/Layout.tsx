import React, { ReactNode } from "react";
import Head from "next/head";
import "bootstrap/dist/css/bootstrap.min.css";
import basePath from "path";

type Props = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children, title = "This is the default title" }: Props) => (
  <div>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <link rel="shortcut icon" href={`${basePath}/favicon.ico`} />
    </Head>

    {children}
  </div>
);

export default Layout;
