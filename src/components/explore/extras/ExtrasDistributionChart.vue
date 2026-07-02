<script setup lang="ts">
import { ref, watch, onMounted } from "vue"
import * as d3 from "d3"

import type { TokenActivation } from "."
import { mapColorContinuous, DEFAULT_CONTINUOUS_CMAP } from "@/utils/colors"

const props = withDefaults(defineProps<{
  data: TokenActivation[];
  binWidth?: number;
  seleToken?: string[];
}>(), { binWidth: 0.025, seleToken: () => [] })

// type
type BinData = d3.Bin<TokenActivation, number>[]

const [width, height] = [256, 144]
const margin = { top: 8, right: 8, bottom: 32, left: 20 }

const innerWidth = width - margin.left - margin.right
const innerHeight = height - margin.top - margin.bottom

// state
const svg = ref<SVGSVGElement | null>(null)

// workflow
function computeBins() {
  const rawMaxX = d3.max(props.data, (d) => d.activation) ?? 1
  const maxX = Math.ceil(rawMaxX / props.binWidth) * props.binWidth

  const binner = d3.bin<TokenActivation, number>()
    .value((d) => d.activation)
    .domain([0, maxX])
    .thresholds(d3.range(0, maxX + props.binWidth, props.binWidth))

  const seleSet = new Set(props.seleToken)
  const restData = seleSet.size ? props.data.filter((d) => !seleSet.has(d.token)) : props.data
  const seleData = seleSet.size ? props.data.filter((d) => seleSet.has(d.token)) : []

  const restBins = binner(restData)
  const seleBins = binner(seleData)

  const x = d3.scaleLinear().domain([0, maxX]).range([0, innerWidth])
  const y = d3.scaleLinear()
    .domain([0, d3.max([...restBins, ...seleBins], (d) => d.length) ?? 0])
    .nice()
    .range([innerHeight, 0])

  return { restBins, seleBins, x, y }
}

function drawChart() {
  const svgEl = d3.select(svg.value)
  svgEl.selectAll("*").remove()
  svgEl.attr("viewBox", `0 0 ${width} ${height}`)

  const { restBins, seleBins, x, y } = computeBins()

  const g = svgEl.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)

  g.append("g")
    .attr("class", "grid-x")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).ticks(5).tickSize(-innerHeight).tickFormat(() => ""))
    .call((sel) => {
      sel.select(".domain").remove()
      sel.selectAll(".tick line").attr("stroke", "#d4d4d8")
    })

  g.append("g")
    .attr("class", "grid-y")
    .call(d3.axisLeft(y).ticks(4).tickSize(-innerWidth).tickFormat(() => ""))
    .call((sel) => {
      sel.select(".domain").remove()
      sel.selectAll(".tick line").attr("stroke", "#d4d4d8")
    })

  const drawBars = (data: BinData, fill: string | ((d: d3.Bin<TokenActivation, number>) => string), opacity = 1, cls = "") => {
    g.append("g")
      .attr("class", cls)
      .selectAll("rect").data(data).join("rect")
      .attr("x", (d) => x(d.x0 ?? 0))
      .attr("width", (d) => Math.max(0, x(d.x1 ?? 0) - x(d.x0 ?? 0)))
      .attr("y", (d) => y(d.length))
      .attr("height", (d) => y(0) - y(d.length))
      .attr("fill", fill as string)
      .attr("opacity", opacity)
  }

  drawBars(
    restBins,
    props.seleToken.length
      ? "#d4d4d8"
      : (d) => mapColorContinuous(d.x1 ?? 0, DEFAULT_CONTINUOUS_CMAP).toHexString(),
    1,
    "bars-rest"
  )
  drawBars(seleBins, "#1b5b9c", 0.6, "bars-sele")

  const styleAxis = (sel: d3.Selection<SVGGElement, unknown, null, undefined>) => {
    sel.select(".domain").attr("stroke", "#737373")
    sel.selectAll(".tick line").attr("stroke", "#737373")
    sel.selectAll(".tick text").attr("fill", "#737373").attr("font-size", "10px")
  }
 
  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).ticks(5).tickSizeOuter(0))
    .call(styleAxis)

  g.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + margin.bottom)
    .attr("text-anchor", "middle")
    .attr("fill", "#737373")
    .attr("font-size", "10px")
    .text("Normalized activation")
 
  g.append("g")
    .call(d3.axisLeft(y).ticks(4).tickSizeOuter(0))
    .call(styleAxis)
}

function updateChart() {
  const svgEl = d3.select(svg.value)

  const { restBins, seleBins, y } = computeBins()

  const g = svgEl.select<SVGGElement>("g")

  g.select(".bars-rest")
    .selectAll<SVGRectElement, d3.Bin<TokenActivation, number>>("rect")
    .data(restBins)
    .transition().duration(300).ease(d3.easeQuadOut)
    .attr("y", (d) => y(d.length))
    .attr("height", (d) => y(0) - y(d.length))
    .attr("fill", (d) => props.seleToken.length
      ? "#d4d4d8"
      : mapColorContinuous(d.x1 ?? 0, DEFAULT_CONTINUOUS_CMAP).toHexString()
    )

  g.select(".bars-sele")
    .selectAll<SVGRectElement, d3.Bin<TokenActivation, number>>("rect")
    .data(seleBins)
    .transition().duration(300).ease(d3.easeQuadOut)
    .attr("y", (d) => y(d.length))
    .attr("height", (d) => y(0) - y(d.length))
}

onMounted(drawChart)

watch(() => [props.data, props.binWidth], drawChart)
watch(() => props.seleToken, updateChart)
</script>

<template>
  <svg ref="svg" width="100%" height="100%"></svg>
</template>