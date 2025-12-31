// Easy access to login/logout/signup logic.

import { useAuthContext } from '../context/AuthContext';

export default function useAuth() {
  return useAuthContext()
}