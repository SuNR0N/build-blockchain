import { BlockModel } from './BlockModel';
import { TransactionModel } from './TransactionModel';

export const CHAIN = 'CHAIN';
export const TRANSACTION = 'TRANSACTION';

interface MessageTypes {
  CHAIN: {
    type: typeof CHAIN;
    data: Array<BlockModel<string>>;
  };
  TRANSACTION: {
    type: typeof TRANSACTION;
    data: TransactionModel,
  };
}

export type Message = MessageTypes[keyof MessageTypes];
