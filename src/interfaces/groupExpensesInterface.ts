export interface GroupExpenseRequest {
  groupId: string;
  payerId: string;
  involvedMembers: string[];
  amount: number;
}

export interface GroupExpenseResponse {
  // Assuming you want to return some fields in the success response
  message: string;
  details: {
    amount: number;
    groupId: string;
    payerId: string;
    involvedMembers: string[];
  };
}
