import Spinner from './Spinner';

interface PageLoaderProps {
  height?: string;
}

export default function PageLoader({ height = 'calc(100vh - 200px)' }: PageLoaderProps) {
  return (
    <div className="flex flex-col justify-center items-center w-full space-y-8 animate-in fade-in duration-500" style={{ height }}>
      <div className="relative flex items-center justify-center">
        {/* Large Decorative Ring */}
        <div className="absolute w-32 h-32 border border-gray-50 rounded-full animate-pulse"></div>
        {/* The Spinner */}
        <Spinner size="lg" />
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-[1px] bg-gray-100"></div>
          <span className="text-[10px] font-black text-black uppercase tracking-[0.4em] leading-none">Connectivity</span>
          <div className="w-8 h-[1px] bg-gray-100"></div>
        </div>
        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest animate-pulse">Synchronizing Infrastructure</p>
      </div>
    </div>
  );
}
