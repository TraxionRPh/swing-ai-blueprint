import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ColorValue,
} from "react-native";
import { LegendProps, TooltipPayload } from "recharts"; // Keep these types if you still feed them data from Recharts on web; otherwise omit
import { cn } from "@/lib/utils"; // If you still need a helper to merge style objects (optional)
//
// ChartConfig Type (unchanged):
//
export type ChartConfig = {
  [k: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType<any>;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<"light" | "dark", string> }
  );
};

//
// ChartContext and hook (unchanged except removing HTML type params):
//
type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

interface ChartContainerProps {
  config: ChartConfig;
  style?: ViewStyle;
  children: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  config,
  style,
  children,
}) => {
  return (
    <ChartContext.Provider value={{ config }}>
      <View style={[styles.chartContainer, style]}>{children}</View>
    </ChartContext.Provider>
  );
};

//
// ChartStyle: cannot inject <style> in React Native, so just return null.
// You’ll need to pass colors explicitly via config or inline styles.
//
export const ChartStyle: React.FC<{
  id: string;
  config: ChartConfig;
}> = () => {
  return null;
};

type ChartTooltipContentProps = {
  active?: boolean;
  payload?: TooltipPayload[];
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  nameKey?: string;
  labelKey?: string;
  formatter?: (
    value: number | string,
    name: string,
    item: TooltipPayload,
    index: number,
    payload: any
  ) => React.ReactNode;
  labelFormatter?: (value: any, payload: TooltipPayload[]) => React.ReactNode;
  label?: string | number;
};

export const ChartTooltipContent = React.forwardRef<
  View,
  ChartTooltipContentProps
>(
  (
    {
      active,
      payload,
      hideLabel = false,
      hideIndicator = false,
      indicator = "dot",
      nameKey,
      labelKey,
      formatter,
      labelFormatter,
      label,
    },
    ref
  ) => {
    const { config } = useChart();

    // If not active or no data, render nothing
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    // Compute the “tooltipLabel” similarly to web version
    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || payload.length === 0) {
        return null;
      }
      const item = payload[0];
      const key = String(labelKey || item.dataKey || item.name || "value");
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const valueLabel =
        (!labelKey && typeof label === "string"
          ? (config[label as keyof typeof config]?.label as string) || label
          : undefined) || (itemConfig?.label as string);

      if (labelFormatter) {
        return (
          <View>
            <Text style={styles.tooltipLabel}>
              {labelFormatter(valueLabel, payload)}
            </Text>
          </View>
        );
      }
      if (!valueLabel) {
        return null;
      }
      return (
        <View>
          <Text style={styles.tooltipLabel}>{valueLabel}</Text>
        </View>
      );
    }, [config, hideLabel, label, labelFormatter, labelKey, payload]);

    const nestLabel = payload.length === 1 && indicator !== "dot";

    return (
      <View ref={ref} style={styles.tooltipContainer}>
        {!nestLabel ? tooltipLabel : null}
        <View style={styles.tooltipItemsContainer}>
          {payload.map((item, index) => {
            const key = String(
              nameKey || item.name || item.dataKey || "value"
            );
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor =
              (item.payload as any)?.fill || (item.color as string);

            return (
              <View style={styles.tooltipRow} key={String(item.dataKey)}>
                {formatter && item.value !== undefined && item.name ? (
                  <>{formatter(item.value, item.name, item, index, item.payload)}</>
                ) : (
                  <>
                    {!hideIndicator && (
                      <View
                        style={[
                          styles.indicatorBase,
                          indicator === "dot" && {
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: indicatorColor,
                          },
                          indicator === "line" && {
                            width: "100%",
                            height: 2,
                            backgroundColor: indicatorColor,
                          },
                          indicator === "dashed" && {
                            width: "100%",
                            height: 0,
                            borderWidth: 1,
                            borderStyle: "dashed",
                            borderColor: indicatorColor,
                          },
                          nestLabel && indicator === "dashed" && {
                            marginVertical: 2,
                          },
                        ]}
                      />
                    )}
                    <View
                      style={[
                        styles.tooltipTextRow,
                        nestLabel
                          ? styles.tooltipTextRowNested
                          : styles.tooltipTextRowDefault,
                      ]}
                    >
                      <View>
                        {nestLabel ? tooltipLabel : null}
                        <Text style={styles.tooltipItemName}>
                          {itemConfig?.label || item.name}
                        </Text>
                      </View>
                      {item.value !== undefined && (
                        <Text style={styles.tooltipItemValue}>
                          {String(item.value).replace(
                            /\B(?=(\d{3})+(?!\d))/g,
                            ","
                          )}
                        </Text>
                      )}
                    </View>
                  </>
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";


type ChartLegendContentProps = {
  payload?: LegendProps["payload"];
  verticalAlign?: "top" | "bottom";
  hideIcon?: boolean;
  nameKey?: string;
};

export const ChartLegendContent = React.forwardRef<
  View,
  ChartLegendContentProps
>(
  (
    {
      payload,
      verticalAlign = "bottom",
      hideIcon = false,
      nameKey,
      ...rest
    },
    ref
  ) => {
    const { config } = useChart();

    if (!payload || payload.length === 0) {
      return null;
    }

    return (
      <View
        ref={ref}
        style={[
          styles.legendContainer,
          verticalAlign === "top" && { paddingBottom: 12 },
          verticalAlign === "bottom" && { paddingTop: 12 },
        ]}
        {...rest}
      >
        {payload.map((item, idx) => {
          const keyStr = String(nameKey || item.dataKey || "value");
          const itemConfig = getPayloadConfigFromPayload(config, item, keyStr);

          return (
            <View style={styles.legendItem} key={String(item.value) + idx}>
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <View
                  style={[
                    styles.legendColorBox,
                    { backgroundColor: item.color as ColorValue },
                  ]}
                />
              )}
              <Text style={styles.legendText}>
                {itemConfig?.label as string}
              </Text>
            </View>
          );
        })}
      </View>
    );
  }
);
ChartLegendContent.displayName = "ChartLegendContent";

//
// getPayloadConfigFromPayload: unchanged logic to pick config for a given key.
//
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: any,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    typeof payload.payload === "object" && payload.payload !== null
      ? (payload.payload as any)
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload &&
    typeof (payload as any)[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = (payload as any)[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof (payloadPayload as any)[
      key as keyof typeof payloadPayload
    ] === "string"
  ) {
    configLabelKey = (payloadPayload as any)[
      key as keyof typeof payloadPayload
    ] as string;
  }

  return configLabelKey in config
    ? (config as any)[configLabelKey]
    : (config as any)[key];
}

//
// Styles
//
type Styles = {
  chartContainer: ViewStyle;
  tooltipContainer: ViewStyle;
  tooltipLabel: TextStyle;
  tooltipItemsContainer: ViewStyle;
  tooltipRow: ViewStyle;
  indicatorBase: ViewStyle;
  tooltipTextRow: ViewStyle;
  tooltipTextRowDefault: ViewStyle;
  tooltipTextRowNested: ViewStyle;
  tooltipItemName: TextStyle;
  tooltipItemValue: TextStyle;
  legendContainer: ViewStyle;
  legendItem: ViewStyle;
  legendColorBox: ViewStyle;
  legendText: TextStyle;
};

const styles = StyleSheet.create<Styles>({
  // Equivalent to the web “flex aspect-video justify-center text-xs …” container
  chartContainer: {
    flex: 1,
    width: "100%",
    aspectRatio: 16 / 9,
    justifyContent: "center",
    alignItems: "center",
    fontSize: 12,
  },

  // Tooltip container (akin to “grid min-w-[8rem] … px-2.5 py-1.5 text-xs shadow-xl”)
  tooltipContainer: {
    minWidth: 128,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB", // “border-border/50”
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  tooltipLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  tooltipItemsContainer: {
    flexDirection: "column",
    gap: 6,
  },
  tooltipRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  indicatorBase: {
    borderRadius: 2,
    marginRight: 6,
  },
  tooltipTextRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tooltipTextRowDefault: {
    alignItems: "center",
  },
  tooltipTextRowNested: {
    alignItems: "flex-end",
  },
  tooltipItemName: {
    fontSize: 12,
    color: "#6B7280", // “text-muted-foreground”
  },
  tooltipItemValue: {
    fontSize: 14,
    fontFamily: "Courier", // “font-mono”
    fontWeight: "500",
    color: "#111827",
  },

  // Legend container (akin to “flex items-center justify-center gap-4”)
  legendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendColorBox: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 14,
    color: "#111827",
  },
});
