export default function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border',
    md: 'w-10 h-10 border-2',
    lg: 'w-16 h-16 border-2',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className="relative">
        {/* Outer track */}
        <div
          className={`${sizeClasses[size]} border-gray-100 rounded-full`}
        />
        {/* Spinning indicator */}
        <div
          className={`${sizeClasses[size]} border-t-black border-transparent rounded-full animate-spin absolute inset-0`}
        />
      </div>
    </div>
  );
}
