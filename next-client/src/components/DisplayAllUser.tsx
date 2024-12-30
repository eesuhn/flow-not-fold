import { createClient } from '@/utils/supabase/server';

export default async function DisplayAllUser() {
  const supabase = await createClient();
  const { data: users } = await supabase.from('User').select();

  console.log('users', users);

  return (
    <div>
      {users?.map((user) => (
        <div key={user.id}>
          <h2>Username: {user.username}</h2>
          <p>User ID: {user.user_id}</p>
        </div>
      ))}
    </div>
  );
}
