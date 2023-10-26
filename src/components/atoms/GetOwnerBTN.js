import { React } from "react";
import { ethers } from "ethers";
const {Web3} = require("web3")

export default function GetOwnerBTN() {
  const web3 = new Web3(window.ethereum)
  const getOwner = async () => {
    const abi = require("../../abi/SimpleAccount.json")
    const contract = new web3.eth.Contract(abi,"0x74dbFB665536AcE9E65b6c9ff5bE1D99AA78eEA8")
    console.log(await contract.methods.owner().call())
  }

  return (
    <div>
        <button onClick={getOwner}>get Owner</button>
    </div>
  );
}