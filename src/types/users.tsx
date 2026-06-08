export type User = {
  id: string;
  name: string;
  email: string;
  profileImageUrl?: string;
};

export type CreateUserRequest = {
  name: string;
  email: string;
};

export type UpdateUserRequest = {
  name?: string;
  email?: string;
};
