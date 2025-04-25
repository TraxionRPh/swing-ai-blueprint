
interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator = ({ currentStep, totalSteps }: ProgressIndicatorProps) => {
  return (
    <div className="flex justify-between mb-6">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="flex-1">
          {index > 0 && <div className="w-2"></div>}
          <div 
            className={`h-2 flex-1 rounded-full ${
              currentStep >= index + 1 ? 'bg-primary' : 'bg-muted'
            }`}
          ></div>
        </div>
      ))}
    </div>
  );
};

export default ProgressIndicator;
