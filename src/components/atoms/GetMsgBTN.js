import { React } from "react";
const { Web3 } = require("web3")

export default function GetMsgBTN({ contractAddress }) {
  const web3 = new Web3(window.ethereum)
  const getMsg = async () => {
    const abi = require("../../abi/messageContract.json");
    const contract = new web3.eth.Contract(abi, contractAddress);
    console.log(await contract.methods.getMessage().call());
  }

  return (
    <div>
      <button onClick={getMsg}>get Msg</button>
    </div>
  );
}