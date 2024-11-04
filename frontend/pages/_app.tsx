import '../styles/globals.css';
import { AppProps } from 'next/app';
import 'regenerator-runtime/runtime';

function MyApp({ Component, pageProps }: AppProps) {
  return (
  <div>
   <Component {...pageProps} />)
  </div>
  );
}

export default MyApp;
