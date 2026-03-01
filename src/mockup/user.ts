import User from "../model/user";
import dayjs from "dayjs";

export const defaultUser: User = {
  userId: "default_user_0",
  admin: false,
  groupId: "default_group_0",
  userName: "default_user_0",
  userProfile: "",
  password: "",
  phone: "01012341234",
  createdAt: dayjs("2026.02.23"),
  updatedAt: dayjs("2026.02.23"),
};

export const adminUser: User = {
  userId: "admin_user_0",
  admin: true,
  groupId: "default_group_0",
  userName: "admin_user_0",
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
