import Web3 from "web3";

const TGE = new Date(1610807400000);
const getTime = (tge, deltaDays) => {
  return new Date(tge.getTime() + deltaDays * 1000 * 60 * 60 * 24);
};

const metrics = [
  {
    name: "Seed Round",
    totalTokens: 600000,
    preMint: 0,
    bonus: 20,
    vestingStart: getTime(TGE, 180),
    vestingEnds: getTime(getTime(TGE, 180), 9 * 30),
  },
  {
    name: "Private Round 1",
    totalTokens: 500000,
    preMint: 100000,
    bonus: 0,
    vestingStart: getTime(TGE, 30),
    vestingEnds: getTime(getTime(TGE, 30), 30 * 9),
  },
  {
    name: "Private Round 2",
    totalTokens: 1021818,
    preMint: 204364,
    bonus: 0,
    vestingStart: getTime(TGE, 30),
    vestingEnds: getTime(getTime(TGE, 30), 30 * 9),
  },
  {
    name: "Reward Pool",
    totalTokens: 3444000,
    preMint: 31684,
    bonus: 0,
    vestingStart: getTime(TGE, 0),
    vestingEnds: getTime(TGE, 1095),
  },
  {
    name: "Team",
    totalTokens: 3000000,
    preMint: 0,
    bonus: 10,
    vestingStart: getTime(TGE, 30 * 9),
    vestingEnds: getTime(getTime(TGE, 30 * 9), 30 * 48),
  },
  {
    name: "Foundation",
    totalTokens: 4000000,
    preMint: 0,
    bonus: 0,
    vestingStart: getTime(TGE, 30 * 18),
    vestingEnds: getTime(getTime(TGE, 30 * 18), 39 * 30),
  },
  {
    name: "Advisor",
    totalTokens: 2000000,
    preMint: 200000,
    bonus: 20,
    vestingStart: getTime(TGE, 30 * 6),
    vestingEnds: getTime(getTime(TGE, 30 * 6), 30 * 48),
  },
  {
    name: "Ecosystem",
    totalTokens: 5084000,
    preMint: 406720,
    bonus: 7,
    vestingStart: getTime(TGE, 30 * 3),
    vestingEnds: getTime(getTime(TGE, 30 * 3), 60 * 30),
  },
  {
    name: "New Tokens",
    totalTokens: 10000000,
    preMint: 0,
    bonus: 0,
    vestingStart: getTime(TGE, 1810), // 1627 days earlier, but pushed by 6 months
    vestingEnds: getTime(getTime(TGE, 1810), 1856), // 1856 days after start
  },
];

const abi = [
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

// RPC endpoints for Ethereum with fallback options
const ethereumRPCs = [
  "https://rpc.ankr.com/eth",
  "https://eth.llamarpc.com",
  "https://ethereum.publicnode.com",
  "https://eth-mainnet.public.blastapi.io",
  "https://ethereum.blockpi.network/v1/rpc/public"
];

// Contract addresses for Ethereum
const ethereumContractAddress = "0x60f67e1015b3f069dd4358a78c38f83fe3a667a9";

// Function to create Web3 instance with RPC fallback
const createWeb3WithFallback = async (rpcList) => {
  for (let i = 0; i < rpcList.length; i++) {
    try {
      const web3 = new Web3(rpcList[i]);
      // Test the connection by getting the latest block number
      await web3.eth.getBlockNumber();
      console.log(`Successfully connected to RPC: ${rpcList[i]}`);
      return web3;
    } catch (error) {
      console.warn(`Failed to connect to RPC ${rpcList[i]}:`, error.message);
      if (i === rpcList.length - 1) {
        throw new Error(`All RPC endpoints failed. Last error: ${error.message}`);
      }
    }
  }
};

// Create web3 instance with fallback
let ethereumWeb3;
let ethereumContract;

// Initialize Web3 and contract with fallback
const initializeWeb3 = async () => {
  try {
    ethereumWeb3 = await createWeb3WithFallback(ethereumRPCs);
    ethereumContract = new ethereumWeb3.eth.Contract(abi, ethereumContractAddress);
    console.log("Web3 and contract initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Web3:", error);
    throw error;
  }
};

// Function to retry with different RPC if current one fails
const retryWithFallback = async (operation, maxRetries = 2) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.warn(`Operation failed on attempt ${attempt + 1}:`, error.message);
      
      if (attempt < maxRetries - 1) {
        console.log("Retrying with different RPC endpoint...");
        // Reinitialize Web3 with a different RPC
        ethereumWeb3 = null;
        ethereumContract = null;
        await initializeWeb3();
      } else {
        throw error;
      }
    }
  }
};

// Fetch the total supply from a contract
const fetchTotalSupply = async (contract, web3Instance) => {
  try {
    const totalSupply = await contract.methods.totalSupply().call();
    const decimals = 18;
    const divisor = BigInt(10 ** decimals);

    const integerPart = BigInt(totalSupply) / divisor;
    const fractionalPart = BigInt(totalSupply) % divisor;

    // Convert fractional part to a string and pad it to 18 digits
    let fractionalStr = fractionalPart.toString().padStart(decimals, "0");

    // Take the first 4 digits of the fractional part for the decimal places
    fractionalStr = fractionalStr.slice(0, 4);

    // Format the result to a string with 4 decimal places
    const formattedSupply = `${integerPart}.${fractionalStr}`;

    return formattedSupply;
  } catch (error) {
    console.error("Error fetching total supply:", error);
    return "0"; // Return '0' in case of error
  }
};

// Fetch total supplies from both chains
export const fetchTotalSupplies = async () => {
  return await retryWithFallback(async () => {
    // Ensure Web3 is initialized
    if (!ethereumWeb3 || !ethereumContract) {
      await initializeWeb3();
    }
    
    const [ethereumTotalSupply] = await Promise.all([
      fetchTotalSupply(ethereumContract, ethereumWeb3),
    ]);
    return {
      ethereum: ethereumTotalSupply,
    };
  });
};

const liquidityProvisions = (timeStamp) => {
  const liquidityTotalTokens = 350182;
  const remaining = liquidityTotalTokens - 80000;
  let endDate = getTime(TGE, 12 * 30);
  if (endDate < timeStamp) return liquidityTotalTokens;
  return (
    (Math.floor(((timeStamp - TGE) * 4) / (endDate - TGE)) * remaining) / 4 +
    80000
  );
};

const currentTokens = (allocation, timestamp) => {
  if (timestamp < allocation.vestingStart) return allocation.preMint;
  let remainingFunds = allocation.totalTokens - allocation.preMint;
  let bonusAmount = (allocation.bonus * remainingFunds) / 100;
  let vestedAmount = remainingFunds - bonusAmount;
  if (timestamp > allocation.vestingEnds) timestamp = allocation.vestingEnds;
  let data =
    allocation.preMint +
    bonusAmount +
    (vestedAmount * (timestamp - allocation.vestingStart)) /
      (allocation.vestingEnds - allocation.vestingStart);
  return data;
};

export const totalTokenSupplyV2 = async () => {
  try {
    const totalChainSupply = await fetchTotalSupplies();

    // let totalSupplyV2 = 20000000;
    // totalSupplyV2 = parseFloat(totalSupplyV2 * 33.33);

    let newChainTotalSupply = 0;
    newChainTotalSupply += parseFloat(totalChainSupply.ethereum);

    // totalSupplyV2 += newChainTotalSupply;
    return newChainTotalSupply.toFixed(4);
  } catch (error) {
    console.error("Error in getCurrentTokenSupply: ", error);
    return 0; // Return 0 in case of error
  }
};

// Adds all the tokens to give circulating supply
const getCurrentTokenSupplyV2 = async (timeStamp) => {
  try {
    timeStamp = timeStamp ? new Date(timeStamp) : new Date();
    let totalSupply = 0;
    for (let i of metrics) {
      totalSupply += currentTokens(i, timeStamp);
    }

    totalSupply += liquidityProvisions(timeStamp);
    totalSupply = parseFloat(totalSupply * 33.33); // Multiplying by 33.33
    return totalSupply.toFixed(4);
  } catch (error) {
    console.error("Error in getCurrentTokenSupply: ", error);
    return 0; // Return 0 in case of error
  }
};

export { getCurrentTokenSupplyV2 };
export default getCurrentTokenSupplyV2;
