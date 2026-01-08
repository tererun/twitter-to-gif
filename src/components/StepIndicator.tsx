type Props = {
  currentStep: number;
  titles: string[];
};

export function StepIndicator({ currentStep, titles }: Props) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {titles.map((title, i) => {
        const stepNum = i + 1;
        return (
          <div key={stepNum} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                currentStep >= stepNum
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
              }`}
            >
              {stepNum}
            </div>
            <span
              className={`text-sm ${
                currentStep >= stepNum
                  ? "text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-400"
              }`}
            >
              {title}
            </span>
            {stepNum < titles.length && (
              <div
                className={`w-8 h-0.5 ${
                  currentStep > stepNum
                    ? "bg-blue-600"
                    : "bg-zinc-200 dark:bg-zinc-800"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
