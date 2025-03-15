export interface ILoggedInUserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  role: string;
  is_active: boolean;
  is_staff: boolean;
  created_at: string;
  updated_at: string;
}

export interface ILoggedInUserDataState {
  userData: ILoggedInUserData;
  setLoggedInUserData: (userData: ILoggedInUserData) => void;
  clearLoggedInUserData: () => void;
}

export interface IUpdatedUserData {
  status: string;
  data: {
    message: string;
    user: ILoggedInUserData;
  };
}

export interface IRemoveUserAvatarData {
  status: string;
  message: string;
  user: ILoggedInUserData;
}
