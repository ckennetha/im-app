import { h } from "vue"
import type { ColumnDef, FilterFn } from "@tanstack/vue-table"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Molecule1DVisualizer } from "../molecule"
import ExploreLink from "../ExploreLink.vue"

import ActivationTableFilter from "./ActivationTableFilter.vue"
import ActivationTableSort from "./ActivationTableSort.vue"

import type { MoleculeSmiles } from "@/store"
import type { FeatureIdx, TokenActivations } from "@/utils/inference"
import { coreTokenTypes, type Token, type CoreTokenType } from "@/utils/tokenize"

import { cn } from "@/lib/utils"
import { activationToColor } from "@/utils/visualizer"

import { Features, type ModelKey } from "@/config"
import { DEFAULT_CATEGORICAL_COLORS, DEFAULT_SEARCH_ROW_SELECTION_MAX } from "@/defaults"

// types
export type ActivationRange = [number, number]

export const sortModes = ["max activation", "mean non-zero activation", "mean all activation"]
export type ActivationSorter = typeof sortModes[number]

export interface FlatTokenActivation extends TokenActivations { featureIdx: FeatureIdx; }

interface TokenActivationAttributes {
  activations: number[];
  colorHexTokens: string[];
  svgOptionsString?: string;
}

// filters
export const filterCoverageInBetween: FilterFn<any> = (
  row, columnId, range: ActivationRange
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

// sorters
const max = (data: number[]) => Math.max(...data)
const mean = (data: number[], divisor: number) => data.reduce((acc, val) => acc + val, 0) / divisor

const firstColumn = (value: any) => h("div", { class: "ps-2 text-left" }, value)

// searchPage util
const groupColors = Object.fromEntries(
  coreTokenTypes.map((cTT, idx) => [cTT, DEFAULT_CATEGORICAL_COLORS[idx]])
)
const buildConceptBadge = (group: CoreTokenType, concept: string) => {
  return h(
    Badge,
    { class: "text-muted", style: { backgroundColor: groupColors[group] ?? "#787774" } },
    { default: () => concept }
  )
}

// columns
export function createActivationColumns(
  tokens: Token[], isInSearchPage?: boolean, model?: ModelKey
) {
  const activationColumns: ColumnDef<FlatTokenActivation>[] = [
    {
      accessorKey: "featureIdx",
      header: () => firstColumn("Feature"),
      cell: ({ row }) => {
        const smi: MoleculeSmiles = tokens.map(tk => tk.token).join('')
        const feature = Number(row.getValue("featureIdx"))
        return firstColumn(h(ExploreLink, { smi, feature }))
      },
      enablePinning: true
    },
    {
      accessorKey: "vis",
      header: ({ table }) => h(
        "div",
        { class: "flex flex-1 items-center gap-x-1 ps-2 text-left" },
        {
          default: () => [
            "Visualization",
            [h(ActivationTableFilter, { table }), h(ActivationTableSort, { table })]
          ]
        }
      ),
      cell: ({ row }) => {
        const { activations, colorHexTokens } = row.getValue<TokenActivationAttributes>('attrs')
        const innerElement = isInSearchPage
          ? h(
            TooltipProvider,
            { disabled: false },
            { default: () => h(Molecule1DVisualizer, { tokens, activations, colorHexTokens }) }
          ) : tokens.map((tk, idx) => h(
            "span",
            {
              style: { backgroundColor: colorHexTokens[idx] },
              class: cn("text-base", isInSearchPage ? "cursor-pointer" : "cursor-default")
            },
            tk.token
          ))
        return h("div", { class: "inline-flex flex-nowrap ps-2 w-full" }, innerElement)
      }
    },

    // hidden columns
    {
      id: "attrs",
      accessorFn: (row): TokenActivationAttributes => {
        const activations = new Array(tokens.length).fill(0.0)
        row.indices.forEach((tkIdx, idx) => { activations[tkIdx] = row.data[idx] })
        const { colorHexTokens, svgOptionsString } = activationToColor(
          tokens, activations, !!isInSearchPage
        )
        return ({ activations, colorHexTokens, svgOptionsString })
      },
      enableHiding: true
    },
    {
      id: "max",
      accessorFn: (row) => max(row.data),
      enableHiding: true
    },
    {
      id: "meanNonzero",
      accessorFn: (row) => mean(row.data, row.data.length),
      enableHiding: true
    },
    {
      id: "meanAll",
      accessorFn: (row) => mean(row.data, tokens.length),
      enableHiding: true
    },
    {
      id: "coverage",
      accessorFn: (row) => row.data.length / tokens.length,
      filterFn: filterCoverageInBetween,
      enableHiding: true
    },
    {
      id: "tokenTypes",
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

  // isInSearchPage cols
  if (isInSearchPage && model) {
    const searchPageColumns: ColumnDef<FlatTokenActivation>[] = [
      {
        id: "concepts",
        header: () => { return h("div", { "class": "text-left" }, "Concepts") },
        cell: ({ row }) => {
          const featureIdx = row.original.featureIdx
          const conceptMap = Features[model][featureIdx]
          return h(
            "div",
            { "class": "flex items-left gap-x-1 text-left" },
            { default: () => { 
              if (!conceptMap) { return "-" }
              return Object.entries(conceptMap).flatMap(([group, concepts]) =>
                concepts.map((concept) => buildConceptBadge(group, concept))
              )
            }}
          )
        }
      },
      {
        id: "show2D",
        header: ({ table }) => {
          const seleRows = table.getState().rowSelection
          const seleRowsCount = Object.keys(seleRows).length
          const pageRows = table.getRowModel().rows
          
          const isAllSelected = pageRows.every(row => seleRows[row.id])
          const isSomeSelected = pageRows.some(row => seleRows[row.id]) && !isAllSelected
          const isDisabled = seleRowsCount >= DEFAULT_SEARCH_ROW_SELECTION_MAX && !isAllSelected

          return h(
            "div",
            { class: "flex flex-row items-center justify-center gap-x-2" },
            { default: () => [
              h(
                Checkbox,
                {
                  "modelValue": isAllSelected || (isSomeSelected && 'indeterminate'),
                  "onUpdate:modelValue": (value: boolean | "indeterminate") => {
                    if (value) {
                      const newSelection = { ...seleRows }
                      const allowedSeleCount = Math.min(
                        DEFAULT_SEARCH_ROW_SELECTION_MAX - seleRowsCount, pageRows.length
                      )
                      
                      if (allowedSeleCount > 0) {
                        let trackNewSeleCount: number = 0
                        for (const row of pageRows) {
                          if (!newSelection[row.id]) {
                            newSelection[row.id] = true; trackNewSeleCount++
                          }
                          if (trackNewSeleCount === allowedSeleCount) break
                        }
                        table.setRowSelection(newSelection)
                      }
                    } else {
                      const newSelection = { ...seleRows }
                      pageRows.forEach(row => { delete newSelection[row.id] })
                      table.setRowSelection(newSelection)
                    }
                  },
                  "disabled": isDisabled,
                  "class": isDisabled ? "!cursor-default" : "",
                  "ariaLabel": "Select all"
              }),
              "2D"
            ]}
          )
        },
        cell: ({ row, table }) => {
          const seleRows = table.getState().rowSelection
          const seleRowsCount = Object.keys(seleRows).length
          const isDisabled = seleRowsCount >= DEFAULT_SEARCH_ROW_SELECTION_MAX && !row.getIsSelected()
          
          return h(
            Checkbox,
            {
              "modelValue": row.getIsSelected(),
              "onUpdate:modelValue": (value: boolean | "indeterminate") => {
                if (!isDisabled) { row.toggleSelected(!!value) }
              },
              "disabled": isDisabled,
              "class": isDisabled ? "!cursor-default" : "",
              "ariaLabel": "Select all"
          })
        }
      }
    ]
    
    activationColumns.splice(1, 0, ...searchPageColumns)
  }
  return activationColumns
}

// utils
export const toFlatTokenActivation = (
  input: Record<FeatureIdx, TokenActivations>
): FlatTokenActivation[] => {
  return Object.entries(input).map(([k, v]) => ({
    featureIdx: k, ...(v as TokenActivations)
  }))
}