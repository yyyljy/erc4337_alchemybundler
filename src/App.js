import { useEffect, useState } from "react";
import { ethers } from "ethers";
import GetOwnerBTN from "./components/atoms/GetOwnerBTN";
import GetMsgBTN from "./components/atoms/GetMsgBTN";
import {
  Box, Flex, Input, Text, Textarea, Table, Tbody, Tr, Td, TableContainer, FormControl, FormLabel, Switch, Divider,
} from "@chakra-ui/react";
import BTN from "./components/atoms/Btn";

import getConfig from "./config";
const { Web3 } = require("web3");
const initOp = {
  sender: ethers.ZeroAddress,
  nonce: "0x",
  initCode: "0x",
  callData: "0x",
  callGasLimit: "0xffffff",
  verificationGasLimit: "0xffffff",
  preVerificationGas: "0xffffff",
  maxFeePerGas: "0xF00000000",
  // maxFeePerGas: "0xaffffffff",
  maxPriorityFeePerGas: "0xaffffffff",
  signature:
    "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
  paymasterAndData: "0x",
};

function App() {
  const [web3, setWeb3] = useState(new Web3(window.ethereum));
  const [account, setAccount] = useState(ethers.ZeroAddress);
  const [entryAddress, setEntryAddress] = useState(ethers.ZeroAddress)
  const [targetAddr, setTargetAddr] = useState(
    "0x7Ac0aC5919212F13D55cbf25d4D7171c5bCFf8cA"
    // "0x6de175459DE142b3bcd1B63d3E07F21Da48c7c14"
  );
  const [scaAddress, setSCAaddress] = useState(ethers.ZeroAddress);
  const [method, setMethod] = useState("setMessage");
  const [Inputs, setInputs] = useState([`testMessage`]);
  const [callData, setCallData] = useState("");
  const [userOp, setUserOp] = useState(initOp);
  const [nonce, setNonce] = useState('-');
  const [gas, setGas] = useState();
  const [chainId, setChainId] = useState(`-`);
  const [funcName, setFuncName] = useState();
  const [funcInput, setFuncInput] = useState();
  const [funcABI, setFuncABI] = useState();
  const [usePaymaster, setUsePaymaster] = useState(false);
  const [paymasterAndData, setPaymasterAndData] = useState("");
  const [balOfERC20, setbalOfERC20] = useState(0);
  const [config, setConfig] = useState();


  useEffect(() => {
    try {
      if (window.ethereum) {
        setWeb3(new Web3(window.ethereum));
        getChainId().then((cid) => {
          console.log(cid);
          if (cid) {
            const cfg = getConfig(cid);
            setConfig(cfg);
          }
        });

        window.ethereum.on('accountsChanged', (account) => {
          setAccount(account[0]);
          setSCAaddress(ethers.ZeroAddress);
          setNonce(`-`);
          setUserOp({
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
          })
        });
        window.ethereum.on('networkChanged', function (networkId) {
          if (networkId) {
            setChainId(networkId);
            const cfg = getConfig(networkId);
            setConfig(cfg);
            fetchEntryPoint();
            setNonce(`-`);
          }
        })
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    // if (account !== ethers.ZeroAddress) getChainId();
    // if (account !== ethers.ZeroAddress && scaAddress === ethers.ZeroAddress) getSCAAddress();
    getSCAAddress();
  }, [account])

  const getChainId = async () => {
    const currentChain = await window.ethereum.request({ method: "eth_chainId" });
    setChainId(currentChain);
    return currentChain;
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
      config?.ALCHEMY_API_URL,
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
    let params = { ...userOp, sender: sender, nonce: "0x0", initCode: initcode }
    const res = await fetchEstimateGas(params);
    console.log(res);
    params = {
      ...params,
      preVerificationGas: res.preVerificationGas,
      verificationGasLimit: res.verificationGasLimit,
      callGasLimit: res.callGasLimit,
    };

    const signed = await signUserOp(params);
    const userOpHash = await sendOp(signed);
    console.log(userOpHash)
  };

  const getNonce = async () => {
    const abi = require("./abi/entrypoint.json");
    const entryContract = new web3.eth.Contract(abi, entryAddress);
    const nonce = await entryContract.methods.getNonce(scaAddress, "0").call();
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

    const calldata = accountABI.encodeFunctionData("execute", [
      targetAddr,
      ethers.ZeroAddress,
      new ethers.Interface(msgabi).encodeFunctionData(method, [Inputs]),
    ]);
    setCallData(calldata);
    setUserOp({ ...userOp, callData: calldata })
    return calldata;
  };

  const signCustomCallData = async () => {
    try {
      if (!funcABI) throw new Error(`function ABI ERROR`);

      let cUserOp = userOp;
      const abi = require("./abi/entrypoint.json");
      const entryContract = new web3.eth.Contract(abi, entryAddress);
      const nonce = await entryContract.methods.getNonce(scaAddress, "0").call();
      cUserOp.nonce = web3.utils.toHex(nonce);

      const accountABI = new ethers.Interface([
        "function execute(address dest, uint256 value, bytes calldata func)",
      ]);
      const customABI2 = new ethers.Interface([funcABI]).encodeFunctionData(funcName, [Inputs]);

      cUserOp.callData = accountABI.encodeFunctionData("execute", [
        targetAddr,
        ethers.ZeroAddress,
        customABI2,
      ]);

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
          params: [cUserOp, entryAddress],
        }),
      };
      await fetch(
        config?.ALCHEMY_API_URL,
        options
      ).then(async (result) => {
        const gasResult = await result.json();
        console.log(`result:${JSON.stringify(gasResult)}`);
        cUserOp = {
          ...cUserOp,
          preVerificationGas: gasResult.result.preVerificationGas,
          verificationGasLimit: gasResult.result.verificationGasLimit,
          callGasLimit: gasResult.result.callGasLimit
        }
      });

      const userOpHash = await getUserOpHash(cUserOp);
      cUserOp.signature = await signUserOpHash(userOpHash);
      sendOp(cUserOp);
      console.log(cUserOp);

    } catch (error) {
      console.log(error);
    }
  };

  const fetchEstimateGas = async (params) => {
    try {
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
        config?.ALCHEMY_API_URL,
        options
      );
      const gasResult = await response.json();
      console.log(gasResult);
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
    } catch (error) {
      console.log(error);
      return false;
    }
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
    fetch(config?.ALCHEMY_API_URL, options)
      .then((response) => response.json())
      .then((response) => {
        if (response?.error) alert(response.error.message);
        console.log("response : ", response)
        return response
      })
      .catch((err) => { alert(err); console.error(err) });
  }

  const contractCreationTest = async () => {
    try {
      console.log("TESTING CONTRACT DEPLOY");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      // const msgSenderFactory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
      // const msgSender = await msgSenderFactory.deploy();
      // const provider = new ethers.BrowserProvider(window.ethereum);

      if (!entryAddress) alert("ENTRYPOINT 주소가 비어있습니다");
      if (!config.ACCOUNT_FACTORY_ADDRESS) alert("ACCOUNT_FACTORY 주소가 비어있습니다");
      const paymasterFactory = new ethers.ContractFactory(config?.PAYMASTER_ARTIFACT?.abi, config?.PAYMASTER_ARTIFACT?.bytecode, signer);
      const paymaster = await paymasterFactory.deploy(config?.ACCOUNT_FACTORY_ADDRESS, "INN", entryAddress);
      console.log(paymaster);

    } catch (error) {
      console.log(error);
    }
  }

  function generatePaymasterAndData(tokenPrice) {
    let pd;
    if (tokenPrice != null) {
      tokenPrice = Buffer.from(tokenPrice);
      pd = ethers.hexlify(
        ethers.concat(
          [config?.PAYMASTER_ADDRESS, ethers.zeroPadValue(ethers.hexlify(tokenPrice), 32)]
        )
      );
    } else {
      pd = ethers.hexlify(ethers.concat([config?.PAYMASTER_ADDRESS]));
    }
    setUserOp({ ...userOp, paymasterAndData: pd })
    setPaymasterAndData(pd);
    return pd;
  }

  async function mintPaymasterErc20(amount) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const paymaster = new ethers.Contract(config?.PAYMASTER_ADDRESS, config?.PAYMASTER_ARTIFACT?.abi, signer);
      const result = await paymaster.mintTokens(scaAddress, amount);
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  }

  async function getBalanceOfPaymasterErc20() {
    try {
      if (scaAddress === ethers.ZeroAddress) alert("SCA ADDRESS is empty");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const paymaster = new ethers.Contract(config?.PAYMASTER_ADDRESS, config?.PAYMASTER_ARTIFACT?.abi, signer);
      const result = await paymaster.balanceOf(scaAddress);
      console.log(Number(result));
      setbalOfERC20(Number(result));
    } catch (error) {
      console.log(error);
    }
  }

  async function depositPaymaster() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const paymaster = new ethers.Contract(config?.PAYMASTER_ADDRESS, config?.PAYMASTER_ARTIFACT?.abi, signer);
    const result = await paymaster.deposit({ value: ethers.parseEther("0.5") });
    console.log(result);
  }

  async function addStake() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const paymaster = new ethers.Contract(config?.PAYMASTER_ADDRESS, config.PAYMASTER_ARTIFACT?.abi, signer);
    const result = await paymaster.addStake(86400 * 2, { value: ethers.parseEther('0.1') });
    // minimumStake : 10_000_000_000_000_000_000
    // miniumUnstakeDelay : 86400
    console.log(result);
  }

  async function sendMsg() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const msgContract = new ethers.Contract(config?.MESSAGE_SENDER_ADDRESS, config?.MESSAGE_SENDER_ARTIFACT?.abi, signer);
    const result = await msgContract.setMessage("DIRECT SEND");
    console.log(result);
  }

  return (
    <div className="App">
      <Flex flexDirection={"column"} gap={"5px"}>
        <Flex width={"600px"} flexDirection={"row"} gap={"10px"}>
          <BTN onClickFunc={getAccounts} name={"지갑연결"} />
          <BTN onClickFunc={fetchEntryPoint} name="EntryPoint CA 조회" />
          <BTN onClickFunc={deploySCA} name="SCA 배포" />
        </Flex>

        <Text>Information Table</Text>
        <TableContainer width={"700px"} borderWidth='5px' borderRadius='lg' padding={"5px"} borderColor={"skyblue"}>
          <Table variant='simple'>
            <Tbody>
              <Tr>
                <Td>ChainId</Td>
                <Td>{chainId}</Td>
              </Tr>
              <Tr>
                <Td>연결된 지갑주소</Td>
                <Td>{account}</Td>
              </Tr>
              <Tr>
                <Td>매칭되는 SCA 주소</Td>
                <Td>{scaAddress}</Td>
              </Tr>
              <Tr>
                <Td>EntryPoint Address</Td>
                <Td>{entryAddress}</Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>

        <label>호출할 Contract Address</label>
        <Input
          name="targetContractAddress" width={"500px"}
          onChange={(e) => {
            setTargetAddr(e.target.value);
          }}
          value={targetAddr}
        ></Input>

        <label>호출할 함수명</label>
        <Input
          name="method"
          value={method} width={"500px"}
          onChange={(e) => {
            setMethod(e.target.value);
          }}
        ></Input>

        <label>Inputs</label>
        <Input
          name="Inputs" width={"500px"}
          onChange={(e) => {
            setInputs(e.target.value);
          }}
        ></Input>


        <Flex gap={"10px"}>
          <BTN onClickFunc={createCallData} name="callData 생성" />
          <Text width={"500px"} >{`callData Length: ${callData?.length}`}</Text>
        </Flex>

        <Flex gap={"10px"}>
          <BTN onClickFunc={getNonce} name="SCA Nonce 조회" />
          <label>{`nonce : ${nonce}`}</label>
        </Flex>


        <Box width={"700px"} alignSelf={"flex-start"} borderWidth='5px' borderRadius='lg' padding={"5px"} borderColor={"blue"}>
          <Flex flexDirection={"column"} gap={"5px"}>
            <Flex gap={"10px"}>
              <FormControl display='flex' alignItems='center'>
                <FormLabel htmlFor='email-alerts' mb='0'>
                  Use Paymaster?
                </FormLabel>
                <Switch mr={"10px"} id='email-alerts' onChange={(e) => {
                  setUsePaymaster(e.target.checked);
                  if (e.target.checked) {
                    setUserOp({ ...userOp, signature: "" });
                    generatePaymasterAndData("10");
                  } else {
                    setPaymasterAndData("");
                    setUserOp({ ...userOp, paymasterAndData: "0x", signature: "" });
                  }
                }} />
              </FormControl>
              {`${config?.PAYMASTER_ADDRESS}`}
            </Flex>
            <Divider />
            <Flex gap={"10px"}>
              <BTN isDisabled={!usePaymaster} onClickFunc={() => { mintPaymasterErc20(1_000_000_000_000_000) }} name="Mint ERC20" />
              <BTN isDisabled={!usePaymaster} onClickFunc={() => { getBalanceOfPaymasterErc20() }} name="BalanceOf" />
              <label>{`balance : ${balOfERC20}`}</label>
            </Flex>
            <Flex gap={"10px"}>
              <BTN isDisabled={!usePaymaster} onClickFunc={() => { depositPaymaster() }} name="Deposit Paymaster" />
              <BTN isDisabled={!usePaymaster} onClickFunc={() => { addStake() }} name="Add Stake" />
            </Flex>
          </Flex>
        </Box>


        <Flex gap={"10px"}>
          <BTN onClickFunc={() => { fetchEstimateGas(userOp); }} name="Gas Fee Estimate" />
          <label>{`gas : ${gas ? JSON.stringify(gas) : ""}`}</label>
        </Flex>

        <BTN onClickFunc={() => { signUserOp(userOp) }} name="UserOp 서명" />

        <Textarea width={"700px"} height={"300px"} onChange={(e) => { setUserOp(e.target.value) }} value={JSON.stringify(userOp, null, 2)} />
        <BTN onClickFunc={() => { sendOp(userOp) }} name="UserOp 전송" />

        <Box width={"700px"} alignSelf={"flex-start"} borderWidth='5px' borderRadius='lg' padding={"5px"} borderColor={"blue"}>
          <Flex flexDirection={"column"} alignItems={"center"} gap={"5px"}>
            <Text>Contract Call</Text>
            <Divider />
            <Flex gap={"10px"}>
              <GetOwnerBTN scaAddress={scaAddress} />
              <GetMsgBTN contractAddress={targetAddr} />
            </Flex>
          </Flex>
        </Box>

        <Box width={"700px"} alignSelf={"flex-start"} borderWidth='5px' borderRadius='lg' padding={"5px"} borderColor={"pink"}>
          <Flex flexDirection={"column"} alignItems={"center"} gap={"5px"}>
            <Text>커스텀 콜 데이터</Text>
            <Divider />
            <Flex gap={"10px"} flexDirection={"column"} alignSelf={"flex-start"}>
              <label>function name</label>
              <Input
                name="Inputs"
                onChange={(e) => {
                  setFuncName(e.target.value);
                  setFuncABI(`function ${e.target.value}(${funcInput})`)
                }}
              ></Input>

              <label>Input types & names</label>

              <Input
                name="Inputs"
                onChange={(e) => {
                  setFuncInput(e.target.value);
                  setFuncABI(`function ${funcName}(${e.target.value})`)
                }}
              ></Input>

              <label>{`function ${funcName}(${funcInput})`}</label>
              <label>Inputs</label>
              <Input
                name="Inputs"
                onChange={(e) => {
                  setInputs(e.target.value);
                }}
              ></Input>
              <BTN onClickFunc={() => { signCustomCallData(); }} name="Sign & Send" />

              <label>Custom callData</label>

              <Input value={callData} name="callData" onChange={(e) => {
                setCallData(e.target.value)
              }}></Input>
            </Flex>
          </Flex>
        </Box>


        <Box width={"700px"} alignSelf={"flex-start"} borderWidth='5px' borderRadius='lg' padding={"5px"} borderColor={"greenyellow"}>
          <Flex flexDirection={"column"} alignItems={"center"} gap={"5px"}>
            <Text>테스트 기능</Text>
            <Divider />
            <Flex gap={"10px"}>
              <BTN onClickFunc={contractCreationTest} name="TestBTN1" />
              <BTN onClickFunc={sendMsg} name="TestBTN2" />
            </Flex>
          </Flex>
        </Box>

      </Flex >
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