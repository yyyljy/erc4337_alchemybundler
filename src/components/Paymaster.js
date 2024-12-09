import { ethers } from "ethers";

export const mintPaymasterErc20 = async (config, sacAddress, amount) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = new ethers.Wallet(
      process.env.REACT_APP_ACCOUNT_PRIVATE_KEY,
      provider
    );
    const paymaster = new ethers.Contract(
      config?.PAYMASTER_ADDRESS,
      config?.PAYMASTER_ARTIFACT?.abi,
      signer
    );
    const result = await paymaster.mintTokens(sacAddress, amount);
    console.log(result);
  } catch (error) {
    console.log(error);
  }
};
