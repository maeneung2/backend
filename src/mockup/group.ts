import Group from "../model/group";
import dayjs from "dayjs";
import { userList } from "./user";

export const defaultGroup: Group = {
  groupId: "default_group_id",
  groupName: "default_group_name",
  groupUsers: userList,
  groupProfile: "",
  groupType: 0,
  scheduleId: "default_schedule_id",
  ownerId: "admin_user_id", //user_id
  createdAt: dayjs("2026.02.23"),
  updatedAt: dayjs("2026.02.23"),
};
