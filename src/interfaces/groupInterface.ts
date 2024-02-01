export interface CreateGroupRequest {
  name: string;
  currentUserId: string; // Assuming the ID is a string, adjust if necessary
}

// If you have a specific structure for the group response, define it as well
export interface GroupResponse {
  id: string;
  name: string;
  createdBy: string;
  members: string[];
}
