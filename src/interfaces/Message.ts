import {
  IBlock,
  ITransaction,
} from './';

export const CHAIN = 'CHAIN';
export const CLEAR_TRANSACTIONS = 'CLEAR_TRANSACTIONS';
export const TRANSACTION = 'TRANSACTION';

interface IMessageType {
  CHAIN: {
    type: typeof CHAIN;
    data: Array<IBlock<ITransaction[]>>;
  };
  CLEAR_TRANSACTIONS: {
    type: typeof CLEAR_TRANSACTIONS;
  };
  TRANSACTION: {
    type: typeof TRANSACTION;
    data: ITransaction,
  };
}

export type Message = IMessageType[keyof IMessageType];
