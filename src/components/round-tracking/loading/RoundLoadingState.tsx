
import React from "react";
import { Loading } from "@/components/ui/loading";

interface RoundLoadingStateProps {
  message?: string;
}

export const RoundLoadingState: React.FC<RoundLoadingStateProps> = ({
  message = "Loading hole data..."
}) => {
  return <Loading message={message} minHeight={250} />;
};
