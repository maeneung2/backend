interface User {
  admin: boolean;
  created_at: Date;
  deleted_at: Date;
  group_id: string;
  id: string;
  phone: string;
  updated_at: Date;
  user_id: string;
  user_name: string;
  user_profile: string;
}

export default User;
