interface User {
  userId: string;
  groupId: string | null;
  id: string;
  userName: string;
  userProfile: string | null;
  phone: string;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export default User;
