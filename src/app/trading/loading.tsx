export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">USDC Buy/Sell DEX</h1>
          <p className="text-lg text-muted-foreground">
            Loading trading interface...
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
