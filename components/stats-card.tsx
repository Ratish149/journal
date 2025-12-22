import { Card, CardContent } from "@/components/ui/card"
import { Activity, DollarSign, Percent, TrendingDown, TrendingUp } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  type: "pnl" | "percentage" | "count"
  trend?: "up" | "down" | "neutral"
}

export function StatsCard({ title, value, type, trend = "neutral" }: StatsCardProps) {
  const getIcon = () => {
    switch (type) {
      case "pnl":
        return trend === "up" ? (
          <TrendingUp className="h-5 w-5 text-emerald-600" />
        ) : trend === "down" ? (
          <TrendingDown className="h-5 w-5 text-rose-600" />
        ) : (
          <DollarSign className="h-5 w-5 text-slate-600" />
        )
      case "percentage":
        return <Percent className="h-5 w-5 text-blue-600" />
      case "count":
        return <Activity className="h-5 w-5 text-violet-600" />
      default:
        return <Activity className="h-5 w-5 text-slate-600" />
    }
  }

  const getValueColor = () => {
    switch (type) {
      case "pnl":
        return trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-600" : "text-slate-900"
      default:
        return "text-slate-900"
    }
  }

  const getIconBgColor = () => {
    switch (type) {
      case "pnl":
        return trend === "up" ? "bg-emerald-50 ring-emerald-100" : trend === "down" ? "bg-rose-50 ring-rose-100" : "bg-slate-50 ring-slate-100"
      case "percentage":
        return "bg-blue-50 ring-blue-100"
      case "count":
        return "bg-violet-50 ring-violet-100"
      default:
        return "bg-slate-50 ring-slate-100"
    }
  }

  return (
    <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 group">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold tracking-tight ${getValueColor()}`}>
                {type === "pnl" && typeof value === "number" && value > 0 ? "+" : ""}
                {value}
                {type === "percentage" ? "%" : ""}
              </span>
            </div>
          </div>
          <div className={`p-2 rounded-lg ring-1 ring-inset transition-colors ${getIconBgColor()}`}>
            {getIcon()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
