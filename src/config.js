const con = {
  ENTRYPOINT_ADDRESS: process.env.REACT_APP_ENTRYPOINT_ADDRESS,
  ACCOUNT_FACTORY_ADDRESS: process.env.REACT_APP_ACCOUNT_FACTORY_ADDRESS,
  MESSAGE_SENDER_ADDRESS: "",
  // SIMPLE_ACCOUNT_ADDRESS: "",
  PAYMASTER_ADDRESS: "",

  ALCHEMY_API_URL: "",

  MESSAGE_SENDER_ARTIFACT: require("../src/abi/MessageSender.json"),
  PAYMASTER_ARTIFACT: require("../src/abi/LegacyTokenPaymaster.json"),
}

const SEPOLIA = ["11155111", "0xaa36a7"];
const MUMBAI = ["80001", "0x13881"];


export default function getConfig(chainId) {
  try {
    console.log(`chainId:${chainId}`);
    console.log(`typeof :${typeof chainId}`);
    let config = { ...con };
    // if (chainId === SEPOLIA.find(chainId)) {
    if (SEPOLIA.indexOf(chainId) >= 0) {
      console.log(`sepolia:${chainId}`);
      config.MESSAGE_SENDER_ADDRESS = "0x7Ac0aC5919212F13D55cbf25d4D7171c5bCFf8cA";
      config.ALCHEMY_API_URL = `https://eth-sepolia.g.alchemy.com/v2/${process.env.REACT_APP_SEPOLIA_API_KEY}`;
      config.PAYMASTER_ADDRESS = "0x4519769a5b6A8dd4ECd17aFD95ccA41F7fFFED7A";

    } else if (MUMBAI.indexOf(chainId) >= 0) {
      console.log(`mumbai:${chainId}`);
      config.MESSAGE_SENDER_ADDRESS = "0x6de175459DE142b3bcd1B63d3E07F21Da48c7c14";
      config.ALCHEMY_API_URL = `https://polygon-mumbai.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`;
      config.PAYMASTER_ADDRESS = "0x236Cdc733C3c3552487B3deCD80D4e50E1cB68A7";

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