export interface GroupExpenseRequest {
  groupId: string;
  payerId: string;
  involvedMembers: string[];
  amount: number;
  category: string;
  description: string;
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
