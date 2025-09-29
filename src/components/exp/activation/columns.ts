import TooltipProvider from "@/components/ui/tooltip/TooltipProvider.vue"
import TokenVisualizer from "../molecule/TokenVisualizer.vue"
import ExploreLink from "../ExploreLink.vue"
import FilterTable from "./FilterTable.vue"
import SortTable from "./SortTable.vue"

import { cn } from "@/lib/utils"
import type { MoleculeSmiles } from "@/store"
import type { FeatureIdx, TokenActivations } from "@/utils/inference"
import type { Token, CoreTokenType } from "@/utils/tokenize"
import { activationToColor } from "@/utils/visualizer"

import type { ColumnDef, FilterFn } from "@tanstack/vue-table"
import type { RDKitModule } from "@rdkit/rdkit"
import { h } from "vue"

// default
const alignLeft = "ps-2 text-left"

// types
export type Range = [number, number]
export type Sorter = "max activation"
  | "mean non-zero activation"
  | "mean all activation"

export interface FlatFeatureActivations extends TokenActivations {
  featureIdx: FeatureIdx;
}

interface DataAttributes {
  activations: number[];
  colorHexTokens: string[];
  svgOptionsString?: string;
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
  if (tokenTypes.length === 0) return true
  const rawValue = row.getValue<Set<CoreTokenType>>(columnId)
  if (rawValue.size !== tokenTypes.length) return false
  return tokenTypes.every(item => rawValue.has(item))
}

// sort utils
const max = (data: number[]) => Math.max(...data)
const mean = (data: number[], divisor: number) =>
  data.reduce((acc, val) => acc + val, 0) / divisor

// columns
export function createActColumns(
  tokens: Token[], isInSearch?: boolean, RDKit?: RDKitModule
) {
  const actsColumns: ColumnDef<FlatFeatureActivations>[] = [
    {
      accessorKey: "featureIdx",
      header: () => h("div", { class: alignLeft }, "Feature"),
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
      cell: ({row}) => {
        const { activations, colorHexTokens } = row.getValue<DataAttributes>('dataAttrs')

        const innerElement = isInSearch
          ? h(TooltipProvider, { disabled: false }, {
                default: () => h(
                  TokenVisualizer, { tokens, activations, colorHexTokens },
                )
              }
            )
          : tokens.map((tk, idx) => h("span", {
              style: { backgroundColor: colorHexTokens[idx] },
              class: cn("text-base", isInSearch ? "cursor-pointer" : "cursor-default")
            }, tk.token))

        const element = h(
          "div", { class: "inline-flex flex-nowrap ps-2 w-full" }, innerElement
        )
        return element
      }
    },
    // hidden columns
    {
      id: "dataAttrs",
      accessorFn: (row): DataAttributes => {
        const activations = new Array(tokens.length).fill(0.0)
        row.indices.forEach((tkIdx, idx) => { activations[tkIdx] = row.data[idx] })
        
        const { colorHexTokens, svgOptionsString } = activationToColor(
          tokens, activations, !!isInSearch
        )
        return ({ activations, colorHexTokens, svgOptionsString })
      },
      enableHiding: true
    },
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

  if (isInSearch && RDKit) {
    const viz2DColumn: ColumnDef<FlatFeatureActivations> = {
      id: "viz2D",
      header: () => h("div", { class: "text-center" }, "Structure"),
      cell: ({row}) => {
        const smiles = tokens.map((tk) => tk.token).join("")
        const mol = RDKit.get_mol(smiles)

        const featureIdx = row.getValue("featureIdx")
        const { svgOptionsString } = row.getValue<DataAttributes>('dataAttrs')
        if (svgOptionsString) {
          const svgString = mol?.get_svg_with_highlights(svgOptionsString)
          const innerElement = h("img", {
            src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString!)}`,
            alt: `f/${featureIdx}`,
            class: "block shrink-0 max-w-none h-56 object-contain"
          })
          return h('div', { class: 'flex items-center justify-center w-full' }, innerElement)
        } else { return h("div", { class: "text-center" }, "Structure unavailable.") }
      }
    }
    actsColumns.push(viz2DColumn)
  }
  
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