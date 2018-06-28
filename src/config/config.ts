export const DIFFICULTY: number = process.env.DIFFICULTY ? parseInt(process.env.DIFFICULTY, 10) : 3;
export const INITIAL_BALANCE: number = 500;
export const MINE_RATE: number = process.env.MINE_RATE ? parseInt(process.env.MINE_RATE, 10) : 3000;
export const MINING_REWARD: number = 50;
export const PEERS: string[] = process.env.PEERS ? process.env.PEERS.split(',') : [];
export const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
export const WS_PORT: number = process.env.WS_PORT ? parseInt(process.env.WS_PORT, 10) : 5001;
