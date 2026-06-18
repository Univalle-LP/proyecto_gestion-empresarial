import { getUser, getRole } from '../repositories/signuplogin';

export const verifyUser = async (data: { uuid: string; name: string }) => {
  return await getUser(data);
};

export const userRole = async (UUID: string) => {
  return await getRole({ id: UUID });
};
