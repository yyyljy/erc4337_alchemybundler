import BTN from "./components/atoms/Btn";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Initialize from "./components/Initialize";
import DeploySAC from "./components/DeploySAC";
import {
  Box,
  Flex,
  Input,
  Text,
  Divider,
  InputGroup,
  InputLeftAddon,
  Tooltip,
  Textarea,
} from "@chakra-ui/react";

import getConfig from "./config";
import { TOOLTIP_CUSTOM_CALL, initUserOp } from "./constraints";
import { getChainId, getAccounts } from "./utils/ethereum";
import GetOwnerBTN from "./components/atoms/GetOwnerBTN";
import GetMsgBTN from "./components/atoms/GetMsgBTN";
import InfoTable from "./components/InfoTable";
import DestinationContractCall from "./components/DestinationContractCall";
import PaymasterControl from "./components/PaymasterControl";
import SignAndSend from "./components/SignAndSend";
import DestinationContractActions from "./components/DestinationContractActions";
import CustomCallData from "./components/CustomCallData";
const { Web3 } = require("web3");

function App() {
  const [web3, setWeb3] = useState(new Web3(window.ethereum));
  const [account, setAccount] = useState(ethers.ZeroAddress);
  const [entryAddress, setEntryAddress] = useState(ethers.ZeroAddress);
  const [targetAddr, setTargetAddr] = useState(
    "0x7Ac0aC5919212F13D55cbf25d4D7171c5bCFf8cA"
    // "0x6de175459DE142b3bcd1B63d3E07F21Da48c7c14"
  );
  const [sacAddress, setSACaddress] = useState(ethers.ZeroAddress);
  const [method, setMethod] = useState("setMessage");
  const [Inputs, setInputs] = useState(``);
  const [callData, setCallData] = useState("");
  const [userOp, setUserOp] = useState(initUserOp);
  const [nonce, setNonce] = useState("-");
  const [gas, setGas] = useState();
  const [chainId, setChainId] = useState(`-`);
  const [config, setConfig] = useState();
  const [balance, setBalance] = useState("0");

  // Paymaster
  const [usePaymaster, setUsePaymaster] = useState(false);
  const [paymasterAndData, setPaymasterAndData] = useState("");
  const [balOfERC20, setbalOfERC20] = useState(0);

  // 커스텀 콜
  const [funcAddr, setFuncAddr] = useState();
  const [funcABI, setFuncABI] = useState();
  const [funcName, setFuncName] = useState();
  const [funcInput, setFuncInput] = useState();

  useEffect(() => {
    try {
      if (window.ethereum) {
        setWeb3(new Web3(window.ethereum));
        getChainId(setChainId).then((cid) => {
          console.log(cid);
          if (cid) {
            const cfg = getConfig(cid);
            setConfig(cfg);
          }
        });
        window.ethereum.on("accountsChanged", (account) => {
          alert("지갑이 변경되었습니다");
          window.location.reload();
          // setAccount(account[0]);
          // setSACaddress(ethers.ZeroAddress);
          // setNonce(`-`);
          // setUserOp({
          //   sender: ethers.ZeroAddress,
          //   nonce: "0x",
          //   initCode: "0x",
          //   callData: "0x",
          //   callGasLimit: "0xffffff",
          //   verificationGasLimit: "0xffffff",
          //   preVerificationGas: "0xffffff",
          //   maxFeePerGas: "0xaffffffff",
          //   maxPriorityFeePerGas: "0xaffffffff",
          //   signature:
          //     "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
          //   paymasterAndData: "0x",
          // })
        });
        window.ethereum.on("chainChanged", function (chainId) {
          alert("네트워크가 변경되었습니다");
          window.location.reload();
        });
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    if (account === ethers.ZeroAddress) return;
    getSACAddress();
  }, [account]);

  const fetchEntryPoint = async () => {
    try {
      if (!config?.ALCHEMY_API_URL) return;
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

      const res = await fetch(config?.ALCHEMY_API_URL, options).catch((err) =>
        console.error(err)
      );

      let addr = (await res.json()).result;
      setEntryAddress(addr[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const getSACAddress = async () => {
    try {
      const acc = await getAccounts(setAccount);
      if (acc === ethers.ZeroAddress) return;
      const abi = require("./abi/SimpleAccountFactory.json");
      const factoryContract = new web3.eth.Contract(
        abi,
        process.env.REACT_APP_ACCOUNT_FACTORY_ADDRESS
      );
      const res = await factoryContract.methods.getAddress(account, "0").call();
      if (res === "0x82d117f06D5FB3bBa93B28C20Fc626Ab2d17404E") {
        alert("CA 주소 읽기 실패로 화면을 새로고침 합니다.");
        window.location.reload();
      }
      if (res) {
        setUserOp({ ...userOp, sender: res });
        setSACaddress(res);
      }

      return res;
    } catch (error) {
      console.log(error);
    }
  };

  const deploySAC = async () => {
    let sender = sacAddress;
    if (sender === ethers.ZeroAddress) sender = await getSACAddress();
    const initcode =
      process.env.REACT_APP_ACCOUNT_FACTORY_ADDRESS +
      "5fbfb9cf000000000000000000000000" +
      account.slice(2) +
      "0000000000000000000000000000000000000000000000000000000000000000";

    let params = {
      ...userOp,
      sender: sender,
      nonce: "0x0",
      initCode: initcode,
    };
    console.log(params);
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
    console.log(userOpHash);
  };

  const getNonce = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const entry = new ethers.Contract(
      entryAddress,
      config.ENTRYPOINT_ARTIFACT.abi,
      signer
    );
    const result = await entry.getNonce(sacAddress, "0");
    let nn = ethers.toBeHex(result);
    setNonce(nn);
    setUserOp({ ...userOp, nonce: nn });
    console.log(nn);
    return nn;
  };

  const createCallData = async () => {
    try {
      if (Inputs?.length <= 0) {
        alert("전송할 메세지를 입력해주세요");
        return;
      }
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
      setUserOp({ ...userOp, callData: calldata });
      // const initcode = process.env.REACT_APP_ACCOUNT_FACTORY_ADDRESS + "5fbfb9cf000000000000000000000000" + account.slice(2) + "0000000000000000000000000000000000000000000000000000000000000000"
      // setUserOp({ ...userOp, initCode: initcode, callData: calldata });
      return calldata;
    } catch (error) {
      console.log(error);
    }
  };

  const signCustomCallData = async () => {
    try {
      if (!funcABI) throw new Error(`function ABI ERROR`);

      let cUserOp = initUserOp;
      cUserOp = { ...cUserOp, sender: sacAddress };
      const abi = require("./abi/entrypoint_abi.json");
      const entryContract = new web3.eth.Contract(abi, entryAddress);
      const nonce = await entryContract.methods
        .getNonce(sacAddress, "0")
        .call();
      cUserOp.nonce = web3.utils.toHex(nonce);

      const accountABI = new ethers.Interface([
        "function execute(address dest, uint256 value, bytes calldata func)",
      ]);
      const customABI2 = new ethers.Interface([funcABI]).encodeFunctionData(
        funcName,
        [Inputs]
      );

      cUserOp.callData = accountABI.encodeFunctionData("execute", [
        funcAddr,
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
      await fetch(config?.ALCHEMY_API_URL, options).then(async (result) => {
        const gasResult = await result.json();
        console.log(`result:${JSON.stringify(gasResult)}`);
        cUserOp = {
          ...cUserOp,
          preVerificationGas: gasResult.result.preVerificationGas,
          verificationGasLimit: gasResult.result.verificationGasLimit,
          callGasLimit: gasResult.result.callGasLimit,
        };
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
      const response = await fetch(config?.ALCHEMY_API_URL, options);
      const gasResult = await response.json();
      console.log(gasResult);
      if (gasResult.result) {
        setUserOp({
          ...userOp,
          preVerificationGas: gasResult.result.preVerificationGas,
          verificationGasLimit: gasResult.result.verificationGasLimit,
          callGasLimit: gasResult.result.callGasLimit,
        });
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

  const sendOp = async (signed) => {
    let param = signed ? signed : userOp;
    console.log(param);
    const res = await fetchAlchemy("eth_sendUserOperation", param);
    console.log(res);
    setInputs("");
    setCallData("");
    setUserOp(initUserOp);
    setNonce("-");
    setGas();
    setBalance("0");
    setPaymasterAndData("");
    setbalOfERC20(0);
  };

  async function getUserOpHash(userOp) {
    const op = await (0, ethers.resolveProperties)(userOp);
    return (0, getUserOpHash2)(op, entryAddress, chainId);
  }

  async function signUserOpHash(userOpHash) {
    // const msg = `0x${Buffer.from(exampleMessage, 'utf8').toString('hex')}`;
    const sign = await window.ethereum.request({
      method: "personal_sign",
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
      let sac = await getSACAddress();
      setSACaddress(sac);
      params = { ...params, sender: sac };
    }
    if (params.nonce === "0x") {
      let nc = await getNonce();
      setNonce(nc);
      params = { ...params, nonce: nc };
    }
    let ent = ethers.ZeroAddress;
    if (entryAddress === ethers.ZeroAddress) {
      ent = await fetchEntryPoint();
      setEntryAddress(ent);
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
        params: [
          params,
          entryAddress === ethers.ZeroAddress ? ent : entryAddress,
        ],
      }),
    };
    fetch(config?.ALCHEMY_API_URL, options)
      .then((response) => response.json())
      .then((response) => {
        if (response?.error) alert(response.error.message);
        console.log("response : ", response);
        return response;
      })
      .catch((err) => {
        alert(err);
        console.error(err);
      });
  };

  function generatePaymasterAndData(tokenPrice) {
    let pd;
    if (tokenPrice != null) {
      tokenPrice = Buffer.from(tokenPrice);
      pd = ethers.hexlify(
        ethers.concat([
          config?.PAYMASTER_ADDRESS,
          ethers.zeroPadValue(ethers.hexlify(tokenPrice), 32),
        ])
      );
    } else {
      pd = ethers.hexlify(ethers.concat([config?.PAYMASTER_ADDRESS]));
    }
    setUserOp({ ...userOp, paymasterAndData: pd });
    setPaymasterAndData(pd);
    return pd;
  }

  async function mintPaymasterErc20(amount) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      // const signer = await provider.getSigner();
      const signer = new ethers.Wallet(
        process.env.REACT_APP_ACCOUNT_PRIVATE_KEY,
        provider
      );
      // signer.get
      const paymaster = new ethers.Contract(
        config?.PAYMASTER_ADDRESS,
        config?.PAYMASTER_ARTIFACT?.abi,
        signer
      );
      const result = await paymaster.mintTokens(sacAddress, amount);
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  }

  async function getBalanceOfPaymasterErc20() {
    try {
      if (sacAddress === ethers.ZeroAddress) alert("SAC ADDRESS is empty");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const paymaster = new ethers.Contract(
        config?.PAYMASTER_ADDRESS,
        config?.PAYMASTER_ARTIFACT?.abi,
        signer
      );
      const result = await paymaster.balanceOf(sacAddress);
      console.log(Number(result));
      setbalOfERC20(Number(result));
    } catch (error) {
      console.log(error);
    }
  }

  async function depositPaymaster() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const paymaster = new ethers.Contract(
      config?.PAYMASTER_ADDRESS,
      config?.PAYMASTER_ARTIFACT?.abi,
      signer
    );
    const result = await paymaster.deposit({ value: ethers.parseEther("0.3") });
    console.log(result);
  }

  async function addStake() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const paymaster = new ethers.Contract(
      config?.PAYMASTER_ADDRESS,
      config.PAYMASTER_ARTIFACT?.abi,
      signer
    );
    const result = await paymaster.addStake(86400 * 2, {
      value: ethers.parseEther("0.1"),
    });
    // minimumStake : 10_000_000_000_000_000_000
    // miniumUnstakeDelay : 86400
    console.log(result);
  }

  async function depositTo() {
    try {
      if (entryAddress === ethers.ZeroAddress) {
        alert("EntryPoint CA 조회를 선행해주세요");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const entrypoint = new ethers.Contract(
        entryAddress,
        config.ENTRYPOINT_ARTIFACT.abi,
        signer
      );
      const balance = await entrypoint.balanceOf(sacAddress);
      console.log(balance);
      const result = await entrypoint.depositTo(sacAddress, {
        value: ethers.parseEther("0.3"),
      });
      console.log(result);
      const balanceAfter = await entrypoint.balanceOf(sacAddress);
      console.log(balanceAfter);
    } catch (error) {
      console.log(error);
    }
  }

  async function getBalance() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const entrypoint = new ethers.Contract(
        entryAddress,
        config.ENTRYPOINT_ARTIFACT.abi,
        signer
      );
      const bal = await entrypoint.balanceOf(sacAddress);
      // alert(bal);
      setBalance(Number(bal));
      console.log(bal);
    } catch (error) {
      console.log(error);
    }
  }

  // TEST FUNCTION
  async function directExecute() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const simpleAccountContract = new ethers.Contract(
        sacAddress,
        config?.SIMPLE_ACCOUNT_ARTIFACT?.abi,
        signer
      );
      const msgabi = require("./abi/messageContract.json");
      const callData = new ethers.Interface(msgabi).encodeFunctionData(
        "setMessage",
        ["직접 실행되나요"]
      );
      const result = await simpleAccountContract.execute(
        targetAddr,
        0,
        callData
      );
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  }

  async function sendMsg() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const msgContract = new ethers.Contract(
      config?.MESSAGE_SENDER_ADDRESS,
      config?.MESSAGE_SENDER_ARTIFACT?.abi,
      signer
    );
    const result = await msgContract.setMessage("DIRECT SEND");
    console.log(result);
  }

  const contractCreationTest = async () => {
    try {
      console.log("TESTING CONTRACT DEPLOY");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      if (!entryAddress) alert("ENTRYPOINT 주소가 비어있습니다");
      if (!config.ACCOUNT_FACTORY_ADDRESS)
        alert("ACCOUNT_FACTORY 주소가 비어있습니다");
      const paymasterFactory = new ethers.ContractFactory(
        config?.PAYMASTER_ARTIFACT?.abi,
        config?.PAYMASTER_ARTIFACT?.bytecode,
        signer
      );
      const paymaster = await paymasterFactory.deploy(
        config?.ACCOUNT_FACTORY_ADDRESS,
        "INN",
        entryAddress
      );
      console.log(paymaster);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="App">
      <Flex flexDirection={"column"} gap={"5px"}>
        <Initialize
          getAccounts={getAccounts}
          fetchEntryPoint={fetchEntryPoint}
          setAccount={setAccount}
          config={config}
          setEntryAddress={setEntryAddress}
        />

        <DeploySAC
          getBalance={getBalance}
          depositTo={depositTo}
          deploySAC={deploySAC}
          balance={balance}
        />

        <InfoTable
          chainId={chainId}
          account={account}
          sacAddress={sacAddress}
          entryAddress={entryAddress}
        />

        <DestinationContractCall
          targetAddr={targetAddr}
          setTargetAddr={setTargetAddr}
          method={method}
          setMethod={setMethod}
          Inputs={Inputs}
          setInputs={setInputs}
          createCallData={createCallData}
          callData={callData}
          getNonce={getNonce}
          nonce={nonce}
        />

        <PaymasterControl
          usePaymaster={usePaymaster}
          setUsePaymaster={setUsePaymaster}
          setUserOp={setUserOp}
          generatePaymasterAndData={generatePaymasterAndData}
          config={config}
          mintPaymasterErc20={mintPaymasterErc20}
          getBalanceOfPaymasterErc20={getBalanceOfPaymasterErc20}
          balOfERC20={balOfERC20}
          depositPaymaster={depositPaymaster}
          addStake={addStake}
          userOp={userOp}
          setPaymasterAndData={setPaymasterAndData}
        />

        <SignAndSend
          userOp={userOp}
          fetchEstimateGas={fetchEstimateGas}
          gas={gas}
          signUserOp={signUserOp}
          sendOp={sendOp}
        />

        <Textarea
          width={"700px"}
          height={"300px"}
          onChange={(e) => {
            setUserOp(e.target.value);
          }}
          value={JSON.stringify(userOp, null, 2)}
        />

        <DestinationContractActions
          sacAddress={sacAddress}
          targetAddr={targetAddr}
        />

        <CustomCallData
          setFuncAddr={setFuncAddr}
          setFuncName={setFuncName}
          setFuncInput={setFuncInput}
          funcName={funcName}
          funcInput={funcInput}
          setInputs={setInputs}
          signCustomCallData={signCustomCallData}
          callData={callData}
          setCallData={setCallData}
          setFuncABI={setFuncABI}
        />

        <Box
          width={"700px"}
          alignSelf={"flex-start"}
          borderWidth="5px"
          borderRadius="lg"
          padding={"5px"}
          borderColor={"black"}
        >
          <Flex flexDirection={"column"} alignItems={"center"} gap={"5px"}>
            <Text>테스트 기능</Text>
            <Divider />
            <Flex gap={"10px"}>
              <BTN onClickFunc={contractCreationTest} name="TestBTN1" />
              <BTN onClickFunc={directExecute} name="TestBTN2" />
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </div>
  );
}

export default App;
