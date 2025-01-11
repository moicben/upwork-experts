import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('https://talentsgroupe.fr/');
  }, [router]);

  return null;
} 