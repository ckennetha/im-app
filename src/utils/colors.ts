import tinycolor from "tinycolor2"
import tinygradient from "tinygradient"
import { DEFAULT_CONTINUOUS_COLORS, DEFAULT_DIVERGING_COLORS } from "@/defaults"

// utils
export function buildColorMap(
  gradientMap: tinycolor.ColorInput[], reverse: boolean=false
): tinygradient.Instance {
  const gradient = tinygradient(gradientMap)
  return reverse ? gradient.reverse() : gradient
}

export function mapColorContinuous(
  value: number, gradient: tinygradient.Instance
): tinycolor.Instance {
  return gradient.rgbAt(Math.min(value, 1.0))
}

export function mapColorDivergent(
  value: number, gradient: tinygradient.Instance
): tinycolor.Instance {
  return gradient.rgbAt((value + 1) / 2)
}

export const DEFAULT_CONTINUOUS_CMAP = buildColorMap(DEFAULT_CONTINUOUS_COLORS, false)
export const DEFAULT_DIVERGING_CMAP = buildColorMap(DEFAULT_DIVERGING_COLORS, false)