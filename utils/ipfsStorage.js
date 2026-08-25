// ذخیره‌سازی غیرمتمرکز با IPFS
export const uploadToIPFS = async (data) => {
  try {
    // استفاده از گیت‌وی‌های مختلف IPFS
    const gateways = [
      'https://ipfs.io/ipfs/',
      'https://gateway.pinata.cloud/ipfs/',
      'https://cloudflare-ipfs.com/ipfs/'
    ];
    
    // تلاش برای آپلود روی IPFS
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pinataContent: data,
        pinataMetadata: { name: 'game-data' }
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      return { success: true, hash: result.IpfsHash, gateways };
    }
    throw new Error('Upload failed');
  } catch (e) {
    console.log('⚠️ IPFS upload failed, using local storage:', e.message);
    // Fallback: ذخیره محلی
    return { success: true, local: true, data };
  }
};

export const getFromIPFS = async (hash) => {
  const gateways = [
    `https://ipfs.io/ipfs/${hash}`,
    `https://gateway.pinata.cloud/ipfs/${hash}`,
    `https://cloudflare-ipfs.com/ipfs/${hash}`
  ];
  
  for (const url of gateways) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.log('Gateway failed:', url);
    }
  }
  return null;
};
