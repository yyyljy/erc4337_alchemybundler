import { React } from "react";
import BTN from "./Btn";
import { ethers } from "ethers";
// const { Web3 } = require("web3")

export default function GetOwnerBTN({ sacAddress }) {
  // console.log(`GetOwner sacAddress[${sacAddress}]`);
  // const web3 = new Web3(window.ethereum)
  const getOwner = async () => {
    const { abi } = require("../../abi/SimpleAccount.json")
    const contract = new ethers.Contract(sacAddress, abi, new ethers.BrowserProvider(window.ethereum));
    console.log(await contract.owner());
    // const contract = new web3.eth.Contract(abi, sacAddress)
    // console.log(await contract.methods.owner().call())
  }

  return (
    <div>
      <BTN onClickFunc={getOwner} name="get Owner" />
    </div>
  );
}