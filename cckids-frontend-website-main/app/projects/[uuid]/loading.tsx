// app/projects/[uuid]/loading.tsx
export default function LoadingProjectDetail() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="h-4 w-80 bg-white/60 rounded animate-pulse mb-6" />
      <div className="h-[420px] bg-gray-100 rounded-[2rem] shadow-lg animate-pulse mb-10" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-10 w-64 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-4/6 bg-gray-100 rounded animate-pulse" />
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl p-8 space-y-4">
          <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
