import TooltipProvider from "@/components/ui/tooltip/TooltipProvider.vue"
import TokenVisualizer from "../molecule/TokenVisualizer.vue"
import ExploreLink from "../ExploreLink.vue"
import FilterTable from "./FilterTable.vue"
import SortTable from "./SortTable.vue"

import type { FeatureIdx, TokenActivations } from "@/utils/inference"
import type { Token, CoreTokenType } from "@/utils/tokenize"
import { activationToColor } from "@/utils/visualizer"

import type { ColumnDef, FilterFn } from "@tanstack/vue-table"
import { h } from "vue"
import type { MoleculeSmiles } from "@/store"

// default
const alignLeft = "ps-2 text-left"

// types
export type Range = [number, number]
export type Sorter = "max activation"
  | "mean non-zero activation"
  | "mean all"

export interface FlatFeatureActivations extends TokenActivations {
  featureIdx: FeatureIdx;
}

// filter logic
export const filterCoverageInBetween: FilterFn<any> = (
  row, columnId, range: Range
) => {
  const rawValue = row.getValue<number>(columnId)
  const min = range[0] / 100
  const max = range[1] / 100
  return rawValue >= min && rawValue <= max
}

export const filterTokenTypes: FilterFn<any> = (
  row, columnId, tokenTypes: CoreTokenType[]
) => {
  const rawValue = row.getValue<Set<CoreTokenType>>(columnId)
  return tokenTypes.some(item => rawValue.has(item))
}

// sort utils
const max = (data: number[]) => Math.max(...data)
const mean = (data: number[], divisor: number) =>
  data.reduce((acc, val) => acc + val, 0) / divisor

// columns
export function createActColumns(tokens: Token[], isInSearch?: boolean) {
  const actsColumns: ColumnDef<FlatFeatureActivations>[] = [
    {
      accessorKey: "featureIdx",
      header: () => h(
        "div", { class: alignLeft }, "Feature"
      ),
      cell: ({row}) => {
        const smi: MoleculeSmiles = tokens.map(tk => tk.token).join('')
        const feature = Number(row.getValue("featureIdx"))
        return h(
          "div", { class: alignLeft }, h(
            ExploreLink,
            { smi, feature }
          )
        )
      },
      enablePinning: true
    },
    {
      accessorKey: "viz",
      header: ({table}) => h(
        "div", {
          class: "flex flex-1 items-center gap-x-1 ps-2 text-left"
        }, {
          default: () => ["Visualization", [
            h(FilterTable, { table }),
            h(SortTable, { table }),
          ]]
        }
      ),
      filterFn: filterCoverageInBetween,
      cell: ({row}) => {
        const { data, indices } = row.original as FlatFeatureActivations

        const activations = new Array(tokens.length).fill(0.0)
        indices.forEach((tkIdx, idx) => { activations[tkIdx] = data[idx] })
        
        const { colorHexTokens } = activationToColor(
          tokens, activations, false
        )

        const innerElement = isInSearch
          ? h(TooltipProvider, { disabled: false }, {
                default: () => h(
                  TokenVisualizer, { tokens, activations, colorHexTokens },
                )
              }
            )
          : tokens.map((tk, idx) => h("span", {
              style: { backgroundColor: colorHexTokens[idx] },
              class: "text-base cursor-pointer"
            }, tk.token))

        const element = h(
          "div", { class: "inline-flex flex-nowrap ps-2 w-full" }, innerElement
        )
        return element
      }
    },
    // hidden
    {
      id: "dataMax",
      accessorFn: (row) => max(row.data),
      enableHiding: true
    },
    {
      id: "dataMeanNonzero",
      accessorFn: (row) => mean(row.data, row.data.length),
      enableHiding: true
    },
    {
      id: "dataMeanAll",
      accessorFn: (row) => mean(row.data, tokens.length),
      enableHiding: true
    },
    {
      id: "dataCoverage",
      accessorFn: (row) => row.data.length / tokens.length,
      filterFn: filterCoverageInBetween,
      enableHiding: true
    },
    {
      id: "dataTokenTypes",
      accessorFn: (row) => {
        const tokenTypes = new Set<CoreTokenType>()
        row.indices.forEach(
          (tkIdx) => tokenTypes.add(tokens[tkIdx].type)
        )
        return tokenTypes
      },
      filterFn: filterTokenTypes,
      enableHiding: true
    }
  ]
  return actsColumns
}

// utils
export const toFlatFeatureActivations = (
  input: Record<FeatureIdx, TokenActivations>
): FlatFeatureActivations[] => {
  return Object.entries(input).map(([k, v]) => ({
    featureIdx: k,
    ...(v as TokenActivations),
  }))
}