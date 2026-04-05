export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
        <h2 className="text-xl font-semibold text-foreground">Loading DirectorChair AI...</h2>
        <p className="text-muted-foreground">Preparing your studio</p>
      </div>
    </div>
  );
}
