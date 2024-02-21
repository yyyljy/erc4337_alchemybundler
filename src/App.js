import { useEffect, useState } from "react";
import { ethers } from "ethers";
import GetOwnerBTN from "./components/atoms/GetOwnerBTN";
import { QRCodeCanvas } from 'qrcode.react';
const { Web3 } = require("web3");

// MSG RECEIVER 0xb1078F5c052f0F8aE22C1FA9E7B6D866EC065809

function App() {
  const [web3, setWeb3] = useState(new Web3(window.ethereum));
  const [account, setAccount] = useState(ethers.ZeroAddress);
  // const entryAddress = process.env.REACT_APP_ENTRYPOINT_ADDRESS;
  const [entryAddress, setEntryAddress] = useState(ethers.ZeroAddress)
  const [targetAddr, setTargetAddr] = useState(
    "0x6de175459DE142b3bcd1B63d3E07F21Da48c7c14"
  );
  const [scaAddress, setSCAaddress] = useState(ethers.ZeroAddress);
  const [method, setMethod] = useState("setMessage");
  const [inputs, setInputs] = useState([`testMessage`]);
  const [callData, setCallData] = useState("");
  const [userOp, setUserOp] = useState({
    sender: ethers.ZeroAddress,
    nonce: "0x",
    initCode: "0x",
    callData: "0x",
    callGasLimit: "0xffffff",
    verificationGasLimit: "0xffffff",
    preVerificationGas: "0xffffff",
    maxFeePerGas: "0xaffffffff",
    maxPriorityFeePerGas: "0xaffffffff",
    signature:
      "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
    paymasterAndData: "0x",
  });
  const [nonce, setNonce] = useState();
  const [gas, setGas] = useState();
  const [chainId, setChainId] = useState();
  // const signer = new ethers.Wallet(process.env.REACT_APP_USER_PRIVATE_KEY, web3.provider);
  const [funcName, setFuncName] = useState();
  const [funcInput, setFuncInput] = useState();
  const [funcABI, setFuncABI] = useState();

  useEffect(() => {
    if (!web3) setWeb3(new Web3(window.ethereum));
    // console.log(ethers.toNumber(chainId))
    // if (account === ethers.ZeroAddress) getAccounts();
    window.postMessage({ type: "hashconnect-connect-extension", pairingString: "" }, "*")
  }, [web3, account]);

  useEffect(() => {
    if (account !== ethers.ZeroAddress) getChainId();
    if (account !== ethers.ZeroAddress && scaAddress === ethers.ZeroAddress) getSCAAddress();
  }, [account, scaAddress])

  const getChainId = async () => {
    let currentChain = await window.ethereum.request({ method: "eth_chainId" });
    setChainId(currentChain);
  };

  const getAccounts = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setAccount(accounts[0]);
      } else {
        alert('INSTALL METAMASK!!');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEntryPoint = async () => {
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: "eth_supportedEntryPoints",
      }),
    };

    const res = await fetch(
      `https://polygon-mumbai.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`,
      options
    ).catch((err) => console.error(err));
    try {
      let addr = (await res.json()).result
      setEntryAddress(addr[0])
    } catch {
      console.log("Fetch Entry Error")
    }
  };

  const getSCAAddress = async () => {
    if (account === ethers.ZeroAddress) getAccounts();
    const abi = require("./abi/SimpleAccountFactory.json");
    const factoryContract = new web3.eth.Contract(
      abi,
      process.env.REACT_APP_ACCOUNT_FACTORY_ADDRESS
    );
    const res = await factoryContract.methods.getAddress(account, "0").call();
    if (res) {
      setUserOp({ ...userOp, sender: res })
      setSCAaddress(res)
    }
    // console.log(res)
    return res;
  };

  const deploySCA = async () => {
    let sender = scaAddress
    if (sender === ethers.ZeroAddress) sender = await getSCAAddress();
    const initcode = process.env.REACT_APP_ACCOUNT_FACTORY_ADDRESS + "5fbfb9cf000000000000000000000000" + account.slice(2) + "0000000000000000000000000000000000000000000000000000000000000000"
    // const params = {
    //   sender: scaAddress,
    //   nonce: "0x0",
    //   initCode: initcode,
    //   callData: "0x",
    //   callGasLimit: "0x238c",
    //   verificationGasLimit: "0x60b15",
    //   preVerificationGas: "0xab90",
    //   maxFeePerGas: "0xfffffffff",
    //   maxPriorityFeePerGas: "0xffffffff",
    //   signature:
    //     "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
    //   paymasterAndData: "0x",
    // };
    const params = { ...userOp, sender: sender, nonce: "0x0", initCode: initcode }
    setUserOp(params)
    const res = await fetchEstimateGas(params);
    let op = {
      ...params,
      preVerificationGas: res.preVerificationGas,
      verificationGasLimit: res.verificationGasLimit,
      callGasLimit: res.callGasLimit,
    };
    setUserOp(op)
    const signed = await signUserOp(op);
    const userOpHash = await sendOp(signed);
    console.log(userOpHash)
  };

  const getNonce = async () => {
    const abi = require("./abi/entrypoint.json");
    const entryContract = new web3.eth.Contract(abi, entryAddress);
    const nonce = await entryContract.methods.getNonce(scaAddress, "0").call();
    // console.log("nonce : ", nonce);
    let nn = web3.utils.toHex(nonce);
    setNonce(nn);
    setUserOp({ ...userOp, nonce: nn })
    return nn;
  };

  const createCallData = async () => {
    const msgabi = require("./abi/messageContract.json");
    const accountABI = new ethers.Interface([
      "function execute(address dest, uint256 value, bytes calldata func)",
    ]);
    // const funcFrag = new ethers.Interface([funcABI])
    // const calldata = accountABI.encodeFunctionData("execute", [
    //   targetAddr,
    //   ethers.ZeroAddress,
    //   funcFrag.encodeFunctionData(funcName, ["gogogoPlease", 100]),
    // ]);

    const calldata = accountABI.encodeFunctionData("execute", [
      targetAddr,
      ethers.ZeroAddress,
      new ethers.Interface(msgabi).encodeFunctionData(method, [inputs]),
    ]);
    setCallData(calldata);
    setUserOp({ ...userOp, callData: calldata })
    return calldata;
  };

  const fetchEstimateGas = async (params) => {
    // await getNonce();
    // params = { ...params, nonce: nonce };
    // console.log(params)
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: "eth_estimateUserOperationGas",
        params: [params, entryAddress],
      }),
    };
    const response = await fetch(
      `https://polygon-mumbai.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`,
      options
    );
    try {
      const gasResult = await response.json();
      if (gasResult.result) {
        setUserOp({
          ...userOp,
          preVerificationGas: gasResult.result.preVerificationGas,
          verificationGasLimit: gasResult.result.verificationGasLimit,
          callGasLimit: gasResult.result.callGasLimit
        })
        setGas(gasResult.result);
        return gasResult.result;
      }
      return false;
    } catch {
      return false;
    }
    // {
    //   "jsonrpc": "2.0",
    //   "id": 1,
    //   "result": {
    //     "preVerificationGas": "0xab84",
    //     "verificationGasLimit": "0x14347",
    //     "callGasLimit": "0x238c"
    //   }
    // }
  };

  const signUserOp = async (op) => {
    const userOpHash = await getUserOpHash(op);
    const signature = await signUserOpHash(userOpHash);
    setUserOp(Object.assign(Object.assign({}, op), { signature }));
    return Object.assign(Object.assign({}, op), { signature });
  };

  const signTx = async () => {
    const data = ""
    const sign = await window.ethereum.request({
      method: 'personal_sign',
      params: [data, account],
    });
    return sign;
  };

  const sendOp = async (signed) => {
    let param = signed ? signed : userOp
    console.log(param)
    const res = await fetchAlchemy("eth_sendUserOperation", param)
    console.log(res)
  };

  async function getUserOpHash(userOp) {
    const op = await (0, ethers.resolveProperties)(userOp);
    return (0, getUserOpHash2)(op, entryAddress, chainId);
  }

  async function signUserOpHash(userOpHash) {
    // const msg = `0x${Buffer.from(exampleMessage, 'utf8').toString('hex')}`;
    const sign = await window.ethereum.request({
      method: 'personal_sign',
      params: [userOpHash, account],
    });
    return sign;
    // return await signer.signMessage(ethers.getBytes(userOpHash));
  }

  async function getUserOpHash2(op, entryPoint, chainId) {
    const userOpHash = ethers.keccak256(await packUserOp(op));
    const enc = new ethers.AbiCoder().encode(
      ["bytes32", "address", "uint256"],
      [userOpHash, entryPoint, ethers.toNumber(chainId)]
    );
    return ethers.keccak256(enc);
  }

  async function packUserOp(op) {
    return new ethers.AbiCoder().encode(
      [
        "address",
        "uint256",
        "bytes32",
        "bytes32",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "bytes32",
      ],
      [
        op.sender,
        ethers.toNumber(op.nonce),
        ethers.keccak256(op.initCode),
        ethers.keccak256(op.callData),
        ethers.toNumber(op.callGasLimit),
        ethers.toNumber(op.verificationGasLimit),
        ethers.toNumber(op.preVerificationGas),
        ethers.toNumber(op.maxFeePerGas),
        ethers.toNumber(op.maxPriorityFeePerGas),
        ethers.keccak256(op.paymasterAndData),
      ]
    );
  }

  const fetchAlchemy = async (method, params) => {
    if (params.sender === ethers.ZeroAddress) {
      let sca = await getSCAAddress()
      setSCAaddress(sca)
      params = { ...params, sender: sca }
    }
    if (params.nonce === "0x") {
      let nc = await getNonce()
      setNonce(nc)
      params = { ...params, nonce: nc }
    }
    let ent = ethers.ZeroAddress
    if (entryAddress === ethers.ZeroAddress) {
      ent = await fetchEntryPoint()
      setEntryAddress(ent)
    }
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: method,
        params: [params, entryAddress === ethers.ZeroAddress ? ent : entryAddress],
      }),
    }
    fetch(`https://polygon-mumbai.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`, options)
      .then((response) => response.json())
      .then((response) => {
        console.log("response : ", response)
        return response
      })
      .catch((err) => console.error(err));
  }

  const contractCreationTest = async () => {
    const bytecode = "0x608060405234801561001057600080fd5b50610808806100206000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c8063368b8772146100515780637a6ce2e11461006d578063ce6d41de1461008b578063d737d0c7146100a9575b600080fd5b61006b600480360381019061006691906103a4565b6100c7565b005b610075610168565b604051610082919061042e565b60405180910390f35b610093610192565b6040516100a091906104c8565b60405180910390f35b6100b1610224565b6040516100be919061042e565b60405180910390f35b80600090816100d69190610700565b5033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055503373ffffffffffffffffffffffffffffffffffffffff167e38ae9f9c9bfeb50a4df18037e2eee236960ec57a3fab6f18af2c5985ca66528260405161015d91906104c8565b60405180910390a250565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6060600080546101a190610519565b80601f01602080910402602001604051908101604052809291908181526020018280546101cd90610519565b801561021a5780601f106101ef5761010080835404028352916020019161021a565b820191906000526020600020905b8154815290600101906020018083116101fd57829003601f168201915b5050505050905090565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6102b182610268565b810181811067ffffffffffffffff821117156102d0576102cf610279565b5b80604052505050565b60006102e361024a565b90506102ef82826102a8565b919050565b600067ffffffffffffffff82111561030f5761030e610279565b5b61031882610268565b9050602081019050919050565b82818337600083830152505050565b6000610347610342846102f4565b6102d9565b90508281526020810184848401111561036357610362610263565b5b61036e848285610325565b509392505050565b600082601f83011261038b5761038a61025e565b5b813561039b848260208601610334565b91505092915050565b6000602082840312156103ba576103b9610254565b5b600082013567ffffffffffffffff8111156103d8576103d7610259565b5b6103e484828501610376565b91505092915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610418826103ed565b9050919050565b6104288161040d565b82525050565b6000602082019050610443600083018461041f565b92915050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610483578082015181840152602081019050610468565b60008484015250505050565b600061049a82610449565b6104a48185610454565b93506104b4818560208601610465565b6104bd81610268565b840191505092915050565b600060208201905081810360008301526104e2818461048f565b905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061053157607f821691505b602082108103610544576105436104ea565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b6000600883026105ac7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8261056f565b6105b6868361056f565b95508019841693508086168417925050509392505050565b6000819050919050565b6000819050919050565b60006105fd6105f86105f3846105ce565b6105d8565b6105ce565b9050919050565b6000819050919050565b610617836105e2565b61062b61062382610604565b84845461057c565b825550505050565b600090565b610640610633565b61064b81848461060e565b505050565b5b8181101561066f57610664600082610638565b600181019050610651565b5050565b601f8211156106b4576106858161054a565b61068e8461055f565b8101602085101561069d578190505b6106b16106a98561055f565b830182610650565b50505b505050565b600082821c905092915050565b60006106d7600019846008026106b9565b1980831691505092915050565b60006106f083836106c6565b9150826002028217905092915050565b61070982610449565b67ffffffffffffffff81111561072257610721610279565b5b61072c8254610519565b610737828285610673565b600060209050601f83116001811461076a5760008415610758578287015190505b61076285826106e4565b8655506107ca565b601f1984166107788661054a565b60005b828110156107a05784890151825560018201915060208501945060208101905061077b565b868310156107bd57848901516107b9601f8916826106c6565b8355505b6001600288020188555050505b50505050505056fea2646970667358221220eb01bd1b5972f53077bf5bd71163ee86ec71994b786f9832a578506b7c49e4a564736f6c63430008140033"
    let param = { ...userOp, callData: bytecode }
    setUserOp(param)
    // await fetchEstimateGas(param)
    // return
    // const res = await fetchAlchemy("eth_sendUserOperation", param)
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>
          <button onClick={getAccounts}>지갑연결</button>
          <button onClick={fetchEntryPoint}>EntryPoint CA 조회</button>
          <button onClick={getNonce}>AA Nonce값 조회</button>
        </p>
        <label>{`ChainId : ${chainId}`}</label>
        <br />
        <label>{`Account : ${account}`}</label>
        <br />
        <label>{`SCA : ${scaAddress}`}</label>
        <br />
        <label>{`EntryPointAddress : ${entryAddress}`}</label>
        <br />
        <label>{`nonce : ${nonce}`}</label>
        <br />
        <label>{`gas : ${gas ? JSON.stringify(gas) : ""}`}</label>
        <br />
        <p>
          <button onClick={deploySCA}>AA 생성</button>
        </p>
        <p>
          <button onClick={getNonce}>AA Nonce값 조회</button>
        </p>
        <p>
          <label>호출할 Contract Address</label>
          <br />
          <input
            name="targetContractAddress"
            onChange={(e) => {
              setTargetAddr(e.target.value);
            }}
            value={targetAddr}
          ></input>
          <br />
          <br />
          <label>호출할 함수명</label>
          <br />
          <input
            name="method"
            value={method}
            onChange={(e) => {
              setMethod(e.target.value);
            }}
          ></input>
          <br />
          <br />
          <label>inputs</label>
          <br />
          <input
            name="inputs"
            onChange={(e) => {
              setInputs(e.target.value);
            }}
          ></input>
          <button
            onClick={() => {
              createCallData();
            }}
          >
            callData 생성
          </button>
          <br />
          <label>callData</label>
          <br />
          <input value={callData} name="callData" onChange={(e) => {
            setCallData(e.target.value)
          }}></input>
        </p>
        <p>
          <button
            onClick={() => {
              fetchEstimateGas(userOp);
            }}
          >
            Gas Fee Estimate
          </button>
        </p>
        <p>
          <button
            onClick={() => {
              signUserOp(userOp);
            }}
          >
            UserOp 서명
          </button>
        </p>
        <p>
          <button
            onClick={() => {
              sendOp();
            }}
          >
            UserOp 전송
          </button>
        </p>
        <GetOwnerBTN scaAddress={scaAddress} />
        <p>
          <button onClick={contractCreationTest}>TestBTN</button>
        </p>
        <p>
          <button onClick={signTx}>SIGN!!!</button>
        </p>
        <br />
        <textarea onChange={(e) => { setUserOp(e.target.value) }} value={JSON.stringify(userOp, null, 2)} />
        <br />
        <label>function name</label>
        <br />
        <input
          name="inputs"
          onChange={(e) => {
            setFuncName(e.target.value);
            setFuncABI(`function ${e.target.value}(${funcInput})`)
          }}
        ></input>
        <br />
        <label>input types & names</label>
        <br />
        <input
          name="inputs"
          onChange={(e) => {
            setFuncInput(e.target.value);
            setFuncABI(`function ${funcName}(${e.target.value})`)
          }}
        ></input>
        <br />
        <label>{`function ${funcName}(${funcInput})`}</label>
      </header>
    </div >
  );
}

export default App;

// {
//   sender: '0x74dbFB665536AcE9E65b6c9ff5bE1D99AA78eEA8',
//   nonce: '0x0',
//   initCode: '0x',
//   callData: '0xb61d27f60000000000000000000000006de175459de142b3bcd1b63d3e07f21da48c7c14000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000064368b87720000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000b746573744d736753656e6400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
//   callGasLimit: '0x581D',
//   verificationGasLimit: '0x5FC1B',
//   preVerificationGas: '0xB248',
//   maxFeePerGas: '0x69A4C7232',
//   maxPriorityFeePerGas: '0x69A4C7220',
//   signature: '0x98c8f0d1e23ac75158cc716cec8ba02d6c4cafa8e9b6f51b34f69fe572f112ed4843fd27a88d93f6a2fe2c7c3dc12a1351d96b781ce054d6a2e4c946d195ba8c1c',
//   paymasterAndData: '0x'
// }