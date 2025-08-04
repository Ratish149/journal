"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Loader2 } from "lucide-react"

interface ChartDisplayProps {
  title: string
  chartUrl: string
  onAddChart: () => void
  gradientFrom: string
  gradientTo: string
  linkColor: string
}

export function ChartDisplay({
  title,
  chartUrl,
  onAddChart,
  gradientFrom,
  gradientTo,
  linkColor,
}: ChartDisplayProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)


  useEffect(() => {
    if (chartUrl) {
      setImageLoading(true)
      setImageError(false)

      const img = new Image()
      img.onload = () => setImageLoading(false)
      img.onerror = () => {
        setImageLoading(false)
        setImageError(true)
      }
      img.src = chartUrl
    }
  }, [chartUrl])

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle
            className={`flex items-center gap-3 text-xl font-bold bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}
          >
            {title}
          </CardTitle>
          {chartUrl && (
            <Button
              variant="outline"
              size="default"
              asChild
              className={`gap-2 hover:${linkColor} border-${linkColor.split("-")[0]}-200`}
            >
              <a href={chartUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Open Chart
              </a>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {chartUrl ? (
          <div className="w-full relative">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-xl z-10">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Loading chart image...</p>
                </div>
              </div>
            )}

            <div
              className="w-full rounded-xl border shadow-lg hover:shadow-xl transition-shadow duration-300"
              style={{
                height: "500px",
                border: "1px solid #e5e7eb",
                backgroundColor: "white",
              }}
            >
              {!imageError ? (
                <img
                  src={chartUrl}
                  alt={`${title} Chart`}
                  className="w-full h-full object-contain rounded-xl"
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageLoading(false)
                    setImageError(true)
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <p className="text-gray-500 mb-2">Chart image not available</p>
                    <p className="text-sm text-gray-400">Please check the image URL</p>
                  </div>
                </div>
              )}
            </div>

            {imageError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">
                  Unable to load chart image. Please check the image URL below.
                </p>
              </div>
            )}

          </div>
        ) : (
          <div className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 mb-4 text-lg">No {title} chart available</p>
              <Button
                variant="outline"
                size="lg"
                onClick={onAddChart}
                className={`hover:${linkColor} border-${linkColor.split("-")[0]}-200`}
              >
                Add Chart URL
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
