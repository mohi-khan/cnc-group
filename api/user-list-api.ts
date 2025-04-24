
import { fetchApi } from "@/utils/http";
import { User } from "@/utils/type";




  export async function GetUsersByRoles() {
    return fetchApi<User[]>({
      url: 'api/auth/users-by-roles',
      method: 'GET',
    })
  }

