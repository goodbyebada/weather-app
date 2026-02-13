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
  type?: "card" | "text" | "circle";
  count?: number;
}

const Loading = ({ type = "card", count = 1 }: LoadingProps) => {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div aria-busy="true" aria-label="로딩 중" role="status">
      {items.map((i) => {
        switch (type) {
          case "card":
            return (
              <div
                key={i}
                className="mb-4 rounded-2xl border border-gray-200 bg-white p-4"
              >
                <Skeleton className="mb-3 h-5 w-2/5" />
                <Skeleton className="mb-2 h-10 w-1/3" />
                <Skeleton className="h-4 w-3/5" />
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
