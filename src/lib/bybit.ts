import { RestClientV5 } from 'bybit-api';

let bybitInstance: RestClientV5 | null = null;

export function getBybitClient(): RestClientV5 {
  if (!bybitInstance) {
    bybitInstance = new RestClientV5({
      key: process.env.BYBIT_API_KEY,
      secret: process.env.BYBIT_API_SECRET,
      testnet: false,
    });
  }
  return bybitInstance;
}
