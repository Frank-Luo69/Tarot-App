import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/tarot');
  return null;
}
