// لیست RPCهای جایگزین برای مناطق تحریم‌شده
export const RPC_PROVIDERS = [
  // RPCهای عمومی (بدون نیاز به API Key)
  {
    name: 'Public Node',
    url: 'https://rpc.sepolia.org',
    fallback: true
  },
  // RPCهای جایگزین
  {
    name: 'Ankr',
    url: 'https://rpc.ankr.com/eth_sepolia',
    fallback: true
  },
  // RPCهای با پشتیبانی از Cloudflare
  {
    name: 'Cloudflare',
    url: 'https://cloudflare-eth.com',
    fallback: true
  },
  // RPCهای با پشتیبانی از GateWay
  {
    name: 'Gateway',
    url: 'https://gateway.tenderly.co/public/sepolia',
    fallback: true
  }
];

export const getWorkingRPC = async () => {
  for (const provider of RPC_PROVIDERS) {
    try {
      const response = await fetch(provider.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_chainId',
          params: [],
          id: 1
        }),
        signal: AbortSignal.timeout(5000)
      });
      if (response.ok) {
        return provider.url;
      }
    } catch (e) {
      console.log(`RPC ${provider.name} failed:`, e.message);
    }
  }
  return RPC_PROVIDERS[0].url; // fallback
};
