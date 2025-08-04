import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Save } from "lucide-react"

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
          <TrendingUp className="h-6 w-6 text-green-600" />
        ) : trend === "down" ? (
          <TrendingDown className="h-6 w-6 text-red-600" />
        ) : (
          <TrendingUp className="h-6 w-6 text-gray-600" />
        )
      case "percentage":
        return <TrendingUp className="h-6 w-6 text-blue-600" />
      case "count":
        return <Save className="h-6 w-6 text-purple-600" />
      default:
        return <TrendingUp className="h-6 w-6 text-gray-600" />
    }
  }

  const getValueColor = () => {
    switch (type) {
      case "pnl":
        return trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-600"
      case "percentage":
        return "text-blue-600"
      case "count":
        return "text-purple-600"
      default:
        return "text-gray-600"
    }
  }

  const getIconBgColor = () => {
    switch (type) {
      case "pnl":
        return trend === "up" ? "bg-green-100" : trend === "down" ? "bg-red-100" : "bg-gray-100"
      case "percentage":
        return "bg-blue-100"
      case "count":
        return "bg-purple-100"
      default:
        return "bg-gray-100"
    }
  }

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-3xl font-bold ${getValueColor()}`}>
              {type === "pnl" && typeof value === "number" && value >= 0 ? "+" : ""}
              {value}
              {type === "percentage" ? "%" : ""}
            </p>
          </div>
          <div className={`p-3 rounded-full ${getIconBgColor()}`}>{getIcon()}</div>
        </div>
      </CardContent>
    </Card>
  )
}
