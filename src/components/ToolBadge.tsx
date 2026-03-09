"use client";

import { cn } from "@/lib/utils";
import { Clock, Calculator, Cloud, Wrench } from "lucide-react";

const TOOL_ICONS: Record<string, React.ReactNode> = {
  get_current_time: <Clock size={12} />,
  calculate: <Calculator size={12} />,
  get_weather: <Cloud size={12} />,
};

const TOOL_LABELS: Record<string, string> = {
  get_current_time: "Time",
  calculate: "Calculator",
  get_weather: "Weather",
};

export function ToolBadge({ toolName }: { toolName: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-300 border border-blue-800/50"
    )}>
      {TOOL_ICONS[toolName] ?? <Wrench size={12} />}
      {TOOL_LABELS[toolName] ?? toolName}
    </span>
  );
}
