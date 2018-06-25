import {
  IBlock,
  ITransaction,
} from './';

export interface IMiner {
  mine(): IBlock<ITransaction[]>;
}
