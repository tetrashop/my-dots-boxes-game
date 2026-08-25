/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      type: "http",
      url: "https://rpc.sepolia.org",
      accounts: [],
    },
  },
};
