
import { useState } from "react";

export const useRoundCourseInfo = () => {
  const [courseName, setCourseName] = useState<string | null>(null);
  const [holeCount, setHoleCount] = useState(18);

  const handleHoleCountSelect = (count: number) => {
    setHoleCount(count);
    sessionStorage.setItem('current-hole-count', count.toString());
  };

  return {
    courseName,
    setCourseName,
    holeCount,
    setHoleCount,
    handleHoleCountSelect
  };
};
