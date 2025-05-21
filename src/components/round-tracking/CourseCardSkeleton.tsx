
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const CourseCardSkeleton = () => {
  return (
    <Card className="cursor-not-allowed hover:shadow-sm transition-shadow">
      <CardContent className="p-6">
        <Skeleton className="h-5 w-3/4 mb-3" />
        <Skeleton className="h-4 w-1/2 mb-3" />
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
    </Card>
  );
};

export const CourseCardSkeletonGrid = ({ count = 9 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array(count).fill(0).map((_, index) => (
        <CourseCardSkeleton key={index} />
      ))}
    </div>
  );
};
