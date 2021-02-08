const _MS_PER_DAY = 1000 * 60 * 60 * 24
const _S_PER_DAY = 60 * 60 * 24

//Difference in Date in milliseconds
function dateDiffInMS(a, b) {
  
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate(), a.getHours(), a.getMinutes(), a.getSeconds(),a.getMilliseconds())
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate(), b.getHours(), b.getMinutes(), b.getSeconds(),b.getMilliseconds())

  return utc2 - utc1
}

const metrics = [
    {
        name: "Seed Round",
        totalTokens: 600000,
        initialDays: 180,
        initialPercent : 0.20,
        restDays: 270,
        vestingDate: new Date("2021-01-16 14:30:00"),
    },
    {
        name: "Private Round 1",
        totalTokens: 500000,
        initialDays: 0,
        initialPercent : 0.20,
        restDays: 270,
        vestingDate: new Date("2021-02-16  14:30:00"),
    },
    {
        name: "Private Round 2",
        totalTokens: 1021818,
        initialDays: 0,
        initialPercent : 0.20,
        restDays: 270,
        vestingDate: new Date("2021-02-16  14:30:00"),
    },
    {
        name: "Reward Pool",
        totalTokens: 3444000,
        initialDays: 0,
        initialPercent : 0.0092,
        restDays: 365,
        vestingDate: new Date("2021-01-16  14:30:00"),
    },
    {
        name: "Team",
        totalTokens: 3444000,
        initialDays: 270,
        initialPercent : 0.10,
        restDays: 365,
        vestingDate: new Date("2021-01-16  14:30:00"),
    },
    {
        name: "Foundation",
        totalTokens: 4000000,
        initialDays: 270,
        initialPercent : 0.10,
        restDays: 365,
        vestingDate: new Date("2021-01-16  14:30:00"),
    },
]

const ecosystemFund = (timeStamp)=>{
    const ecosystemTotalTokens = 5084000;

    let tokens = 0

    let currentPeriod = dateDiffInMS(new Date("2021-01-16  14:30:00"),timeStamp)
    if(currentPeriod/_MS_PER_DAY >= 0 ) tokens = 406720 //Day 0

    if(Math.floor(currentPeriod/_MS_PER_DAY) >= 90)
    {
        tokens += (ecosystemTotalTokens-tokens)*.07 //3 months

        let month = Math.floor((currentPeriod/1000 - 90*_S_PER_DAY)/30)
        tokens += (ecosystemTotalTokens-tokens)*month*0.05 //5% monthly 
    }

    return tokens
}

const liquidityProvisions = (timeStamp)=>{
    const liquidityTotalTokens = 350000;

    let tokens = 0
    let currentPeriod = dateDiffInMS(new Date("2021-01-16  14:30:00"),timeStamp)
    if(currentPeriod/_MS_PER_DAY >= 0 ) tokens = 80010 //Day 0

    let quarter = Math.floor(currentPeriod/_MS_PER_DAY) / 90
    if(quarter >=  1)
    {
        tokens += ((liquidityTotalTokens-tokens)/4)*Math.floor(quater)//quaterly for 12 months
    }

    return tokens
}

const partnersAdvisors = (timeStamp)=>{
    const partnersTotalTokens = 2000000;

    let tokens = 0;

    let currentPeriod = dateDiffInMS(new Date("2021-01-16  14:30:00"),timeStamp)
    if(currentPeriod/_MS_PER_DAY >= 0 ) tokens = 200000 //Day 0

    if(Math.floor(currentPeriod/_MS_PER_DAY) >= 90)
    {
        tokens += (partnersTotalTokens-tokens)*.10 //3 months

        if(dateDiffInMS(new Date("2021-02-16  14:30:00"),timeStamp)>=0) //9 months linearly
            tokens += (partnersTotalTokens-tokens)*(Math.floor(currentPeriod/1000 - 90*_S_PER_DAY)) / Math.floor(270*_S_PER_DAY) 
    }

    return tokens
}


const currentTokens = (allocation,timeStamp)=>{

    let tokens = 0;
    
    let currentPeriod = dateDiffInMS(new Date("2021-01-16  14:30:00"),timeStamp) 
    
    if(Math.floor(currentPeriod/_MS_PER_DAY) >= allocation.initialDays)
    {
        let initial = allocation.totalTokens*allocation.initialPercent //Day 0
  
        let linear = 0;
        if(dateDiffInMS(allocation.vestingDate,timeStamp)>=0) //Linearly After Vesting Date
            linear = (allocation.totalTokens-initial)*(Math.floor(currentPeriod/1000 - allocation.initialDays*_S_PER_DAY)) / Math.floor(allocation.restDays*_S_PER_DAY)
        
        tokens  = initial + linear;
    }

    return tokens
}

// Adds all the tokens to give circualting supply
const getCurrentTokenSupply = (timeStamp) => {

    if(!timeStamp) timeStamp = new Date()
    else{
        timeStamp = new Date(timeStamp)
    }

    let totalSupply = 0

    metrics.forEach(allocation => totalSupply += currentTokens(allocation,timeStamp))

    totalSupply += ecosystemFund(timeStamp) + liquidityProvisions(timeStamp) + partnersAdvisors(timeStamp)

    return totalSupply.toFixed(4)
}

export default getCurrentTokenSupply