const { ethers } = require('ethers');
const artifact = require("../src/abi/LegacyTokenPaymaster.json");

async function main() {
  // const provider = new ethers.JsonRpcProvider("https://polygon-mumbai-bor-rpc.publicnode.com");
  // const provider = new ethers.AlchemyProvider("sepolia", process.env.REACT_APP_ALCHEMY_API_KEY);
  // const signer = new ethers.Wallet(operatorKey, provider);
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const accountFactory = "0x9406cc6185a346906296840746125a0e44976454"
  const symbol = "ING"
  const entrypointAddress = "0x" + "5ff137d4b0fdcd49dca30c7cf57e578a026d2789".toUpperCase()
  const paymasterFactory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
  const paymaster = await paymasterFactory.deploy(accountFactory, symbol, entrypointAddress);
  console.log(paymaster);

  // let paymasterAddress =  "0xcD0048A5628B37B8f743cC2FeA18817A29e97270"
  // let paymaster = ethers.getContractAt("EntryPoint",entrypointAddress)
  // const entryPoint = await new EntryPoint__factory(signer).attach(entrypointAddress)
  // await entryPoint.depositTo(paymasterAddress, { value: parseEther('1') })
  // await paymaster.addStake(1, { value: parseEther('2') })
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
