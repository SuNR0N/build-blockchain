export const DIFFICULTY: number = process.env.DIFFICULTY ? parseInt(process.env.DIFFICULTY, 10) : 3;
export const INITIAL_BALANCE: number = 500;
export const MINE_RATE: number = process.env.MINE_RATE ? parseInt(process.env.MINE_RATE, 10) : 3000;
export const MINING_REWARD: number = 50;
