export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        <h2 className="text-xl font-semibold text-foreground">Loading DirectorchairAI...</h2>
        <p className="text-muted-foreground">Please wait while we prepare your AI video studio</p>
      </div>
    </div>
  );
}
