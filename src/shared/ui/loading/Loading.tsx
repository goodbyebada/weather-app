interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className = "" }: SkeletonProps) => {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 ${className}`}
      aria-hidden="true"
    />
  );
};

interface LoadingProps {
  type?: "card" | "text" | "circle" | "weather-main" | "hourly" | "info-grid";
  count?: number;
  className?: string;
}

const Loading = ({ type = "card", count = 1, className = "" }: LoadingProps) => {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      aria-busy="true"
      aria-label="로딩 중"
      role="status"
      className={className}
    >
      {items.map((i) => {
        switch (type) {
          case "card":
            return (
              <div
                key={i}
                className="mb-4 rounded-3xl border border-gray-200 bg-white p-6 h-[220px] flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <div className="w-1/2">
                    <Skeleton className="mb-2 h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <div className="flex justify-between items-end">
                   <div className="w-1/2">
                      <Skeleton className="mb-2 h-10 w-20" />
                      <Skeleton className="h-4 w-16" />
                   </div>
                   <Skeleton className="h-16 w-16 rounded-full" />
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            );
          case "weather-main":
            return (
              <div
                key={i}
                className="mb-6 overflow-hidden rounded-3xl bg-gray-100 p-8 h-[380px] flex flex-col items-center justify-center gap-3"
              >
                <Skeleton className="h-8 w-32 mb-1" />
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-32 w-32 rounded-full mb-3" />
                <Skeleton className="h-16 w-32 mb-1" />
                <Skeleton className="h-6 w-24 mb-3" />
                <div className="flex gap-6">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            );
          case "info-grid":
             return (
              <div key={i} className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                 {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="rounded-3xl bg-white p-4 h-[80px] flex flex-col items-center justify-center gap-2 border border-gray-100">
                       <Skeleton className="h-3 w-12" />
                       <Skeleton className="h-6 w-16" />
                    </div>
                 ))}
              </div>
             );
          case "hourly":
            return (
               <div key={i} className="mb-6 rounded-3xl bg-white p-6 border border-gray-100 h-[290px]">
                 <Skeleton className="h-6 w-32 mb-6" />
                 <div className="flex gap-6 overflow-hidden">
                    {[...Array(6)].map((_, idx) => (
                       <div key={idx} className="flex flex-col items-center gap-2 min-w-[70px]">
                          <Skeleton className="h-3 w-10" />
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <Skeleton className="h-5 w-8" />
                       </div>
                    ))}
                 </div>
               </div>
            );
          case "text":
            return <Skeleton key={i} className="mb-2 h-4 w-full" />;
          case "circle":
            return <Skeleton key={i} className="h-12 w-12 rounded-full" />;
        }
      })}
      <span className="sr-only">로딩 중</span>
    </div>
  );
};

export { Skeleton };
export default Loading;
