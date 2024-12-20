const { ethers } = require("ethers");
const artifact = require("../src/abi/MessageSender.json");

async function msgSenderDeploy() {
  // const provider = new ethers.AlchemyProvider("sepolia", "qi_CqFczPxdn5GUyNWEStBTOjfaylzVh");
  const provider = new ethers.JsonRpcProvider(
    "https://eth-holesky.g.alchemy.com/v2/qi_CqFczPxdn5GUyNWEStBTOjfaylzVh"
  );
  const signer = new ethers.Wallet("", provider);
  const msgSenderFactory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    signer
  );
  const msgSender = await msgSenderFactory.deploy();
  console.log(msgSender);
}

msgSenderDeploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
