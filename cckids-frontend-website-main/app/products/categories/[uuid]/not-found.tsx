// app/products/categories/[uuid]/loading.tsx
export default function Loading() {
  return (
    <div className="relative z-10">
      <main className="flex-grow relative z-10">
        {/* Hero Skeleton */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="w-20 h-20 bg-gray-200 rounded-3xl animate-pulse" />
                <div className="h-16 bg-gray-200 rounded-2xl animate-pulse w-3/4" />
                <div className="h-12 bg-gray-200 rounded-full animate-pulse w-48" />
              </div>
              <div className="h-80 bg-gray-200 rounded-3xl animate-pulse" />
            </div>
          </div>
        </section>

        {/* Search Skeleton */}
        <section className="py-6 px-4 sticky top-20 z-40 bg-white/60 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="h-14 w-full md:w-96 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </section>

        {/* Products Skeleton */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-[2rem] overflow-hidden shadow-lg">
                  <div className="h-56 bg-gray-200 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
                    <div className="h-6 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
