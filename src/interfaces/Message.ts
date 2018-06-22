import { IBlock } from './Block';
import { ITransaction } from './Transaction';

export const CHAIN = 'CHAIN';
export const TRANSACTION = 'TRANSACTION';

interface IMessageType {
  CHAIN: {
    type: typeof CHAIN;
    data: Array<IBlock<string>>;
  };
  TRANSACTION: {
    type: typeof TRANSACTION;
    data: ITransaction,
  };
}

export type Message = IMessageType[keyof IMessageType];
