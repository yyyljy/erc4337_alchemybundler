export const getChainId = async (setChainId) => {
  const currentChain = await window.ethereum.request({
    method: "eth_chainId",
  });
  setChainId(currentChain);
  return currentChain;
};

export const getAccounts = async (setAccount) => {
  try {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
      return accounts[0];
    } else {
      alert("INSTALL METAMASK!!");
    }
  } catch (error) {
    console.error(error);
  }
};

export const fetchEntryPoint = async (config, setEntryAddress) => {
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
