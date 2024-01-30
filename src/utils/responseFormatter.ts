import { GroupDocument } from "../models/GroupModel"; // Assuming GroupType is the TypeScript type for your Group model

interface GroupResponse {
  _id?: string;
  id: string;
  name: string;
  createdBy: string;
  members: string[];
}

/**
 * Formats a group document into a GroupResponse object.
 * @param group The group document to format.
 * @returns The formatted GroupResponse object.
 */
export const formatGroupResponse = (group): GroupResponse => {
  return {
    id: group._id.toString(),
    name: group.name,
    createdBy: group.createdBy.toString(),
    members: group.members.map((member) => member.toString()),
  };
};
