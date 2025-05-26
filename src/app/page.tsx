import ClientLexicalEditor from '@/components/ClientLexicalEditor';

export default function HomePage() {
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Lexical Editor in Next.js</h1>
      <ClientLexicalEditor />
    </main>
  );
}