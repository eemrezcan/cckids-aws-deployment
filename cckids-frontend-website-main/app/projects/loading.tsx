// app/projects/loading.tsx
export default function LoadingProjects() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="h-10 w-64 bg-white/60 rounded-2xl animate-pulse mb-6" />
      <div className="h-6 w-96 bg-white/60 rounded-2xl animate-pulse mb-10" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-white rounded-[2rem] overflow-hidden shadow-lg">
            <div className="h-64 bg-gray-100 animate-pulse" />
            <div className="p-6 space-y-3">
              <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
              <div className="h-6 w-3/4 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
