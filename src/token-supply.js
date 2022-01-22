const TGE = new Date(1610807400000)
const getTime = (tge, deltaDays)=>{
    return new Date(tge.getTime() + deltaDays*1000*60*60*24)
}
const metrics = [
    {
        name: "Seed Round",
        totalTokens: 600000,
        preMint: 0,
        bonus: 20,
        vestingStart: getTime(TGE, 180),
        vestingEnds: getTime(getTime(TGE, 180), 9*30),
    },
    {
        name: "Private Round 1",
        totalTokens: 500000,
        preMint: 100000,
        bonus: 0,
        vestingStart: getTime(TGE, 30),
        vestingEnds: getTime(getTime(TGE, 30), 30*9),
    },
    {
        name: "Private Round 2",
        totalTokens: 1021818,
        preMint: 204364,
        bonus: 0,
        vestingStart: getTime(TGE, 30),
        vestingEnds: getTime(getTime(TGE, 30), 30*9),
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
        vestingStart: getTime(TGE, 30*9),
        vestingEnds: getTime(getTime(TGE, 30*9), 30*48),
    },
    {
        name: "Foundation",
        totalTokens: 4000000,
        preMint: 0,
        bonus: 0,
        vestingStart: getTime(TGE, 30*18),
        vestingEnds: getTime(getTime(TGE, 30*18), 39*30),
    },
    {
        name: "Advisor",
        totalTokens: 2000000,
        preMint: 200000,
        bonus: 20,
        vestingStart: getTime(TGE, 30*6),
        vestingEnds: getTime(getTime(TGE, 30*6), 30*48),
    },
    {
        name: "Ecosystem",
        totalTokens: 5084000,
        preMint: 406720,
        bonus: 7,
        vestingStart: getTime(TGE, 30*3),
        vestingEnds: getTime(getTime(TGE, 30*3), 60*30),
    }
]


const liquidityProvisions = (timeStamp)=>{
    const liquidityTotalTokens = 350182;
    const remaining = liquidityTotalTokens - 80000
    let endDate = getTime(TGE, 12*30)
    if (endDate<timeStamp) return liquidityTotalTokens
    return (Math.floor((timeStamp-TGE)*4/(endDate-TGE))*(remaining)/4) + 80000
}

const currentTokens = (allocation, timestamp) => {
    if (timestamp < allocation.vestingStart) return allocation.preMint
    let remainingFunds = allocation.totalTokens-allocation.preMint
    let bonusAmount = allocation.bonus*(remainingFunds)/100
    let vestedAmount = remainingFunds- bonusAmount
    if (timestamp > allocation.vestingEnds) timestamp = allocation.vestingEnds
    let data = allocation.preMint + bonusAmount + (vestedAmount*(timestamp - allocation.vestingStart)/(allocation.vestingEnds-allocation.vestingStart))
    return data
}
// Adds all the tokens to give circualting supply
const getCurrentTokenSupply = (timeStamp) => {
    timeStamp = timeStamp ? new Date(timeStamp) : new Date()
    let totalSupply = 0
    for (let i of metrics){
        totalSupply += currentTokens(i, timeStamp)
    }
    totalSupply += liquidityProvisions(timeStamp)
    return totalSupply.toFixed(4)
}

export default getCurrentTokenSupply