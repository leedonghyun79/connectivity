import Spinner from './Spinner';

interface PageLoaderProps {
  height?: string;
}

export default function PageLoader({ height = 'calc(100vh - 200px)' }: PageLoaderProps) {
  return (
    <div className="flex justify-center items-center w-full" style={{ height }}>
      <Spinner size="lg" />
    </div>
  );
}
