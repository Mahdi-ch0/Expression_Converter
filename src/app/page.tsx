import ExpressionConverter from '@/components/expression-converter';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background">
      <ExpressionConverter />
    </main>
  );
}
