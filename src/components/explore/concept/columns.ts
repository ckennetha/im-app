import { h } from "vue"
import { ArrowUp, ArrowUpDown } from "lucide-vue-next"
import type { Column, ColumnDef, SortDirection } from "@tanstack/vue-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"
import { type CoreTokenType, coreTokenTypes } from "@/utils/tokenize"

import { DEFAULT_CATEGORICAL_COLORS } from "@/defaults"

// types
export interface ConceptData {
  concept: string;
  group: CoreTokenType;
  thresh: number;
  tPos: number;
  precision: number;
  recall: number;
  f1Score: number;
  tPosSub: number | null;
  comment: string | null;
}

const firstColumn = (value: string) => h("div", { class: "px-1 text-left" }, value)
const sortableColumnHeader = (
  column: Column<ConceptData>,
  columnName: string,
  sortType: false | SortDirection
) => {
  return h(
    "div",
    { class: "flex flex-1 items-center justify-between gap-x-2 text-left" },
    {
      default: () => [
        columnName,
        h(
          Button,
          {
            size: "icon",
            class: "!justify-center !size-4 !p-0 !border-0 !shadow-none !bg-transparent hover:!bg-transparent group",
            onClick: () => column.toggleSorting(column.getIsSorted() === "asc")
          },
          {
            default: () => sortType ? h(
                ArrowUp,
                {
                  class: cn(
                    "text-muted-foreground group-hover:text-foreground transition-transform",
                    sortType === "asc" ? "rotate-0" : "rotate-180"
                  )
                }
              ) : h(
                ArrowUpDown, { class: "text-muted-foreground group-hover:text-foreground" }
              )
          }
        )
      ]
    }
  )
}

const groupColors = Object.fromEntries(
  coreTokenTypes.map((cTT, idx) => [cTT, DEFAULT_CATEGORICAL_COLORS[idx]])
)

// columns
export const getConceptColumns = (data: ConceptData[]): ColumnDef<ConceptData>[] => {
  // tPosSub
  const hasTPosSub: boolean = data.some(row => row.tPosSub !== null)
  const tPosSubColumn: ColumnDef<ConceptData> = {
    accessorKey: "tPosSub",
    header: ({ column }) => {
      const sortType = column.getIsSorted()
      return sortableColumnHeader(column, "TPs Substructure", sortType)
    },
    cell: ({ getValue }) => { return getValue<number | null>() ?? "-" },
    enableSorting: true
  }
  
  // main columns
  const conceptColumns: ColumnDef<ConceptData>[] = [
    {
      accessorKey: "concept",
      header: () => firstColumn("Concept"),
      cell: ({ getValue }) => firstColumn(getValue<string>()),
      enablePinning: true
    },
    {
      accessorKey: "group",
      header: "Group",
      cell: ({ getValue }) => {
        const group = getValue<CoreTokenType>()
        return h(
          Badge,
          {
            class: "text-muted",
            style: { backgroundColor: groupColors[group] ?? "#787774" }
          },
          { default: () => group }
        )
      },
      enableSorting: true
    },
    {
      accessorKey: "thresh",
      header: ({ column }) => {
        const sortType = column.getIsSorted()
        return sortableColumnHeader(column, "Threshold", sortType)
      },
      enableSorting: true
    },
    {
      accessorKey: "tPos",
      header: ({ column }) => {
        const sortType = column.getIsSorted()
        return sortableColumnHeader(column, "TPs", sortType)
      },
      enableSorting: true
    },
    ...(hasTPosSub ? [tPosSubColumn] : []),
    {
      accessorKey: "precision",
      header: ({ column }) => {
        const sortType = column.getIsSorted()
        return sortableColumnHeader(column, "Precision", sortType)
      },
      enableSorting: true
    },
    {
      accessorKey: "recall",
      header: ({ column }) => {
        const sortType = column.getIsSorted()
        return sortableColumnHeader(column, "Recall", sortType)
      },
      enableSorting: true
    },
    {
      accessorKey: "f1Score",
      header: ({ column }) => {
        const sortType = column.getIsSorted()
        return sortableColumnHeader(column, "F1 Score", sortType)
      },
      enableSorting: true
    },
    {
      accessorKey: "comment",
      header: "Comment",
      cell: ({ getValue }) => { return getValue<string | null>() ?? "-" }
    },
  ]

  return conceptColumns
}