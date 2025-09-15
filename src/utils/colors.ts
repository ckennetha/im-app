import { DEFAULT_CONTINUOUS_COLORS } from "@/cfg"

import tinycolor from "tinycolor2"
import tinygradient from "tinygradient"

// default
export const DEFAULT_CONTINUOUS_CMAP = buildColorMap(DEFAULT_CONTINUOUS_COLORS, false)

// function
export function buildColorMap(
  gradientMap: tinycolor.ColorInput[], reverse: boolean=false
): tinygradient.Instance {
  const gradient = tinygradient(gradientMap)
  return reverse ? gradient.reverse() : gradient
}

export function mapColorContinuous(
  value: number, gradient: tinygradient.Instance
): tinycolor.Instance {
  const valueCapped = Math.min(value, 1.0)
  const color = gradient.rgbAt(valueCapped)
  return color
}