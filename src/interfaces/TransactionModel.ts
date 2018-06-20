export interface TransactionModel {
  id: string;
  input: any;
  outputs: any[];
}

export interface TransactionOutputModel {
  address: string;
  amount: number;
}
