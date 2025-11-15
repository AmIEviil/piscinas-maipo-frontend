import { useMutation } from "@tanstack/react-query";
import { metricsService } from "../core/services/MetricsService";

export const useDailyMetrics = () => {
  const metricsDailyMutation = useMutation({
    mutationFn: metricsService.getDailyMetrics,
    onError: (error: unknown) => {
      console.log(error);
    },
    // onSuccess: (data) => {
    //   console.log(data);
    // },
  });
  return metricsDailyMutation;
};
