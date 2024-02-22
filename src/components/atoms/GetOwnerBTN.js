import { Button } from "@chakra-ui/react";
import { React } from "react";
import BTN from "./Btn";
const { Web3 } = require("web3")

export default function GetOwnerBTN({ scaAddress }) {
  const web3 = new Web3(window.ethereum)
  const getOwner = async () => {
    const abi = require("../../abi/SimpleAccount.json")
    const contract = new web3.eth.Contract(abi, scaAddress)
    console.log(await contract.methods.owner().call())
  }

  return (
    <div>
      <BTN onClickFunc={getOwner} name="get Owner" />
    </div>
  );
}