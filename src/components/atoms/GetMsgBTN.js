import { React } from "react";
import BTN from "./Btn";
const { Web3 } = require("web3")

export default function GetMsgBTN({ contractAddress }) {
  // console.log(`GetMsgBTN contractAddress[${contractAddress}]`);
  const web3 = new Web3(window.ethereum)
  const getMsg = async () => {
    const messageArtifact = require("../../abi/MessageSender.json");
    const contract = new web3.eth.Contract(messageArtifact.abi, contractAddress);
    console.log(await contract.methods.getMessage().call());
  }

  return (
    <div>
      <BTN onClickFunc={getMsg} name="get Msg" />
    </div>
  );
}