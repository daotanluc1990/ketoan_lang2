import { LoginForm } from '@/components/auth/LoginForm';

export const dynamic = 'force-dynamic';

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = typeof params?.next === 'string' && params.next.startsWith('/') ? params.next : '/tong-quan';
  return <LoginForm nextPath={next} />;
}
