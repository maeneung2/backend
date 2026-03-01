import User from "../model/user";
import dayjs from "dayjs";

export const defaultUser: User = {
  userId: "default_user_id",
  admin: false,
  groupId: "default_group_id",
  userName: "default_user_id",
  userProfile: "",
  password: "",
  phone: "01012341234",
  createdAt: dayjs("2026.02.23"),
  updatedAt: dayjs("2026.02.23"),
};

export const adminUser: User = {
  userId: "admin_user_id",
  admin: true,
  groupId: "default_group_id",
  userName: "admin_user_id",
  userProfile: "",
  password: "",
  phone: "01012341234",
  createdAt: dayjs("2026.02.23"),
  updatedAt: dayjs("2026.02.23"),
};

export const userList: User[] = [
  defaultUser,
  defaultUser,
  defaultUser,
  defaultUser,
  defaultUser,
  defaultUser,
  adminUser,
];
