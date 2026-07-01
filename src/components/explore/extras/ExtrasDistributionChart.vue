<script setup lang="ts">
import { ref, watch, onMounted } from "vue"
import * as d3 from "d3"

import type { TokenActivation } from "."
import { mapColorContinuous, DEFAULT_CONTINUOUS_CMAP } from "@/utils/colors"

const props = withDefaults(defineProps<{
  data: TokenActivation[];
  binWidth?: number;
  seleToken?: string | null;
}>(), { binWidth: 0.025, seleToken: "S" })

const [width, height] = [256, 144]
const margin = { top: 8, right: 8, bottom: 32, left: 20 }

// state
const svg = ref<SVGSVGElement | null>(null)

// workflow
function drawChart() {
  const svgEl = d3.select(svg.value)
  svgEl.selectAll("*").remove()

  svgEl.attr("viewBox", `0 0 ${width} ${height}`)

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const g = svgEl.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)

  const rawMaxX = d3.max(props.data, (d) => d.activation) ?? 1
  const maxX = Math.ceil(rawMaxX / props.binWidth) * props.binWidth
  
  const bins = d3.bin<TokenActivation, number>()
    .value((d) => d.activation)
    .domain([0, maxX])
    .thresholds(d3.range(0, maxX + props.binWidth, props.binWidth))

  const restData = props.seleToken
    ? props.data.filter((d) => d.token !== props.seleToken)
    : props.data
  const seleData = props.seleToken
    ? props.data.filter((d) => d.token === props.seleToken)
    : []

  const restBins = bins(restData)
  const seleBins = bins(seleData)
  
  const x = d3.scaleLinear()
    .domain([0, maxX])
    .range([0, innerWidth])

  const y = d3.scaleLinear()
    .domain([0, d3.max([...restBins, ...seleBins], (d) => d.length) ?? 0])
    .nice()
    .range([innerHeight, 0])

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

  g.append("g")
    .selectAll("rect")
    .data(restBins)
    .join("rect")
    .attr("x", (d) => x(d.x0 ?? 0))
    .attr("width", (d) => Math.max(0, x(d.x1 ?? 0) - x(d.x0 ?? 0)))
    .attr("y", (d) => y(d.length))
    .attr("height", (d) => y(0) - y(d.length))
    .attr("fill", (d) => props.seleToken
      ? "#d4d4d8"
      : mapColorContinuous(d.x1 ?? 0, DEFAULT_CONTINUOUS_CMAP).toHexString()
    )

  if (props.seleToken) {
    g.append("g")
      .selectAll("rect")
      .data(seleBins)
      .join("rect")
      .attr("x", (d) => x(d.x0 ?? 0))
      .attr("width", (d) => Math.max(0, x(d.x1 ?? 0) - x(d.x0 ?? 0)))
      .attr("y", (d) => y(d.length))
      .attr("height", (d) => y(0) - y(d.length))
      .attr("fill", "#1b5b9c")
      .attr("opacity", 0.6)
  }
 
  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).ticks(5).tickSizeOuter(0))
    .call((sel) => {
      sel.select(".domain").attr("stroke", "#737373")
      sel.selectAll(".tick line").attr("stroke", "#737373")
      sel.selectAll(".tick text").attr("fill", "#737373").attr("font-size", "10px")
    })

  g.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + margin.bottom)
    .attr("text-anchor", "middle")
    .attr("fill", "#737373")
    .attr("font-size", "10px")
    .text("Normalized activation")
 
  g.append("g")
    .call(d3.axisLeft(y).ticks(4).tickSizeOuter(0))
    .call((sel) => {
      sel.select(".domain").attr("stroke", "#737373")
      sel.selectAll(".tick line").attr("stroke", "#737373")
      sel.selectAll(".tick text").attr("fill", "#737373").attr("font-size", "10px")
    })
}

onMounted(drawChart)

watch(() => [props.data, props.binWidth, props.seleToken], drawChart)
</script>

<template>
  <svg ref="svg" width="100%" height="100%"></svg>
</template>