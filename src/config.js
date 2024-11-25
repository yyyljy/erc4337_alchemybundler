const con = {
  ENTRYPOINT_ADDRESS: process.env.REACT_APP_ENTRYPOINT_ADDRESS,
  ACCOUNT_FACTORY_ADDRESS: process.env.REACT_APP_ACCOUNT_FACTORY_ADDRESS,
  MESSAGE_SENDER_ADDRESS: "",
  // SIMPLE_ACCOUNT_ADDRESS: "",
  PAYMASTER_ADDRESS: "",

  ALCHEMY_API_URL: "",

  ENTRYPOINT_ARTIFACT: require("../src/abi/entrypoint.json"),
  MESSAGE_SENDER_ARTIFACT: require("../src/abi/MessageSender.json"),
  PAYMASTER_ARTIFACT: require("../src/abi/LegacyTokenPaymaster.json"),
  SIMPLE_ACCOUNT_ARTIFACT: require("../src/abi/SimpleAccount.json"),
};

const SEPOLIA = ["11155111", "0xaa36a7"];
const HOLESKY = ["17000", "0x4268"];

export default function getConfig(chainId) {
  try {
    // console.log(`chainId:${chainId}`);
    // console.log(`typeof :${typeof chainId}`);
    let config = { ...con };
    if (SEPOLIA.indexOf(chainId) >= 0) {
      console.log(`NETWORK : sepolia(${Number(chainId)})`);
      config.MESSAGE_SENDER_ADDRESS =
        "0x7Ac0aC5919212F13D55cbf25d4D7171c5bCFf8cA";
      config.ALCHEMY_API_URL = `https://eth-sepolia.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_SEPOLIA_API_KEY}`;
      config.PAYMASTER_ADDRESS = "0x4519769a5b6A8dd4ECd17aFD95ccA41F7fFFED7A";
    } else if (HOLESKY.indexOf(chainId) >= 0) {
      console.log(`NETWORK : holesky:(${Number(chainId)})`);
      config.MESSAGE_SENDER_ADDRESS =
        "0x4a4CFBc0F65211cCA76cE810880f14a2bCb3bb70";
      config.ALCHEMY_API_URL = `https://eth-holesky.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_HOLESKY_API_KEY}`;
      config.PAYMASTER_ADDRESS = "0x";
    } else {
      console.log(chainId);
      alert("NETWORK ERROR");
      throw new Error(`NETWORK ERROR`);
    }

    return config;
  } catch (error) {
    console.log(error);
    // return new Error(error);
    return con;
  }
}
