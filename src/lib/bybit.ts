import { RestClientV5 } from 'bybit-api';

export const bybit = new RestClientV5({
  key: process.env.BYBIT_API_KEY,
  secret: process.env.BYBIT_API_SECRET,
  testnet: false, // Set to true if using testnet
});
