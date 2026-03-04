interface User {
  userId: string;
  groupId: string | null;
  id: string;
  userName: string;
  userProfile: string | null;
  phone: string;
  admin: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export default User;
