import { UserManagementClient } from '@/components/system/UserManagementClient';
import { listAppUsers } from '@/lib/auth/app-users';

export async function UserManagementPage() {
  const users = await listAppUsers();
  return <UserManagementClient initialUsers={users} />;
}
