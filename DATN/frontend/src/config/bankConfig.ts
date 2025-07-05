import { BankInfo, BankId } from '@/types/bank';

export const bankList: BankInfo[] = [
  {
    id: "vcb",
    name: "Vietcombank",
    accountNumber: "1234567890",
    accountName: "NGUYEN VAN A",
    branch: "Ha Noi6",
    logo: "/images/banks/bidv.jpg"
  }
];

export const getBankInfo = (bankId: BankId): BankInfo | undefined => {
  return bankList.find(bank => bank.id === bankId);
}; 