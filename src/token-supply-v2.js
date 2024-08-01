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
    vestingStart: getTime(TGE, 1627),
    vestingEnds: getTime(getTime(TGE, 1627), 1856),
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

// RPC endpoints for Ethereum and Polygon
const ethereumRPC = "https://eth.llamarpc.com";
const polygonRPC = "https://polygon.llamarpc.com";

// Contract addresses for Ethereum and Polygon
const ethereumContractAddress = "0x60f67e1015b3f069dd4358a78c38f83fe3a667a9";
const polygonContractAddress = "0x93890f346c5d02c3863a06657bc72555dc72c527";

// Create web3 instances for Ethereum and Polygon
const ethereumWeb3 = new Web3(ethereumRPC);
const polygonWeb3 = new Web3(polygonRPC);

// Create contract instances
const ethereumContract = new ethereumWeb3.eth.Contract(
  abi,
  ethereumContractAddress
);
const polygonContract = new polygonWeb3.eth.Contract(
  abi,
  polygonContractAddress
);

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
  const [ethereumTotalSupply, polygonTotalSupply] = await Promise.all([
    fetchTotalSupply(ethereumContract, ethereumWeb3),
    fetchTotalSupply(polygonContract, polygonWeb3),
  ]);
  return {
    ethereum: ethereumTotalSupply,
    polygon: polygonTotalSupply,
  };
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

const fetchRouteTokenAmount = async () => {
  try {
    const response = await fetch(
      "https://sentry.lcd.routerprotocol.com/cosmos/bank/v1beta1/supply"
    );
    const data = await response.json();
    const routeToken = data.supply.find((token) => token.denom === "route");
    const routeAmount = routeToken
      ? parseFloat(routeToken.amount) / 10 ** 18
      : 0;
    return routeAmount;
  } catch (error) {
    console.error("Error fetching route token amount: ", error);
    return 0; // Return 0 in case of error
  }
};

export const totalTokenSupplyV2 = async () => {
  try {
    const routeAmount = await fetchRouteTokenAmount();
    const totalChainSupply = await fetchTotalSupplies();

    // let totalSupplyV2 = 20000000;
    // totalSupplyV2 = parseFloat(totalSupplyV2 * 33.33);

    let newChainTotalSupply = 0;
    newChainTotalSupply += routeAmount;
    newChainTotalSupply += parseFloat(totalChainSupply.ethereum);
    newChainTotalSupply += parseFloat(totalChainSupply.polygon);

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
    const routeAmount = await fetchRouteTokenAmount();
    const totalChainSupply = await fetchTotalSupplies();

    timeStamp = timeStamp ? new Date(timeStamp) : new Date();
    let totalSupply = 0;
    for (let i of metrics) {
      totalSupply += currentTokens(i, timeStamp);
    }

    totalSupply += liquidityProvisions(timeStamp);
    totalSupply = parseFloat(totalSupply * 33.33); // Multiplying by 33.33

    let newChainTotalSupply = 0;
    newChainTotalSupply += routeAmount;
    newChainTotalSupply += parseFloat(totalChainSupply.ethereum);
    newChainTotalSupply += parseFloat(totalChainSupply.polygon);
    newChainTotalSupply -= 1000000000;

    totalSupply += newChainTotalSupply;
    return totalSupply.toFixed(4);
  } catch (error) {
    console.error("Error in getCurrentTokenSupply: ", error);
    return 0; // Return 0 in case of error
  }
};

export default getCurrentTokenSupplyV2;
