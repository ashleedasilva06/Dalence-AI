export function Skeleton({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`animate-pulse rounded-xl ${className}`}
      style={{ background: "linear-gradient(90deg, #F3F0EA 25%, #E8E4DC 50%, #F3F0EA 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", ...style }}/>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl p-5" style={{ background: "white", border: "1px solid rgba(10,61,61,0.08)" }}>
      <Skeleton className="h-4 w-24 mb-4"/>
      <Skeleton className="h-8 w-16 mb-2"/>
      <Skeleton className="h-3 w-32"/>
    </div>
  );
}

export function ResumeSkeleton() {
  return (
    <div className="rounded-2xl p-6" style={{ background: "white", border: "1px solid rgba(10,61,61,0.08)" }}>
      <div className="flex items-center gap-3 mb-5">
        <Skeleton className="w-10 h-10 rounded-xl"/>
        <div className="flex-1"><Skeleton className="h-4 w-40 mb-2"/><Skeleton className="h-3 w-24"/></div>
      </div>
      <Skeleton className="h-2 w-full mb-4"/>
      <div className="flex flex-wrap gap-2">
        {[80,60,100,70,90].map(w => <Skeleton key={w} className="h-7 rounded-full" style={{ width: w }}/>)}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <CardSkeleton key={i}/>)}
      </div>
      <div className="grid grid-cols-2 gap-6">
        {[1,2].map(i => (
          <div key={i} className="rounded-2xl p-5" style={{ background: "white", border: "1px solid rgba(10,61,61,0.08)" }}>
            <Skeleton className="h-4 w-32 mb-5"/>
            <Skeleton className="h-44 w-full"/>
          </div>
        ))}
      </div>
    </div>
  );
}