const { ethers } = require('ethers');
const artifact = require("../src/abi/MessageSender.json");

async function msgSenderDeploy() {
  const provider = new ethers.AlchemyProvider("sepolia", "qi_CqFczPxdn5GUyNWEStBTOjfaylzVh");
  const signer = new ethers.Wallet("f03e13869ab65bf1f295ac645dc52225a1fc0931df0f9af56bfe9517c5cc8a60", provider);
  const msgSenderFactory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
  const msgSender = await msgSenderFactory.deploy();
  console.log(msgSender);
}

msgSenderDeploy()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
