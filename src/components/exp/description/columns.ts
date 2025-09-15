import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import TextTooltip from "./TextTooltip.vue"

import { DEFAULT_CATEGORICAL_COLORS } from "@/cfg"
import { cn } from "@/lib/utils"
import type { CoreTokenType } from "@/utils/tokenize"
import { coreTokenTypes } from "@/utils/tokenize"

import type { ColumnDef } from "@tanstack/vue-table"
import { ArrowUp, ArrowUpDown, LucideCheck, LucideX } from "lucide-vue-next"
import { h } from "vue"

// types
interface ThresholdMetrics {
  thresh: number;
  tPos: number;
  precision: number;
  recall: number;
  f1Score: number;
}
type MetricDataKey = keyof Pick<
  ThresholdMetrics,
  'tPos' | 'precision' | 'recall' | 'f1Score'
>

export interface ConceptData {
  concept: string;
  conceptType: string;
  conceptTypeGroup: string | CoreTokenType;
  reviewed: boolean;
  metrics: ThresholdMetrics[];
}

// default
const groupColors = Object.fromEntries(
  coreTokenTypes.map((cTT, idx) => [cTT, DEFAULT_CATEGORICAL_COLORS[idx]])
)

const METRICS: Record<
  string, { label: string; key: MetricDataKey; text: string }
> = {
  tp: {
    label: "TPs",
    key: "tPos",
    text: "Number of times a token is activated<br>across a set of samples for this feature",
  },
  p: {
    label: "Pre",
    key: "precision",
    text: "TPs / total activated tokens<br>for that feature",
  },
  r: {
    label: "Rec",
    key: "recall",
    text: "TPs / total occurrences of<br>the same token in the samples",
  }, 
  f1: {
    label: "F1",
    key: "f1Score",
    text: "Harmonic mean of Pre and Rec",
  },
}
type MetricKey = keyof typeof METRICS

// columns
export function createConceptColumns(rows: ConceptData[]) {
  const thrs: number[] = Array.from(
    new Set(
      rows.flatMap((conc) => conc.metrics.map(metric => metric.thresh))
    )
  )

  const baseColumns: ColumnDef<ConceptData>[] = [
    {
      accessorKey: "concept",
      header: () => h("div", { class: "ps-2 text-left" }, "Concept"),
      cell: ({getValue}) => {
        return h("div", { class: "ps-2 text-left" }, getValue<string>())
      },
      enablePinning: true
    },
    {
      accessorKey: "conceptType",
      header: "Type",
    },
    {
      accessorKey: "conceptTypeGroup",
      header: ({ column }) => {
        const sortType = column.getIsSorted()
        return h(
          "div", {
            class: "flex flex-1 items-center justify-between gap-x-2 text-left"
          }, {
            default: () => ["Type group",
              h(Button, {
                size: "icon",
                class: "!justify-center !size-4 !p-0 !border-0 !shadow-none !bg-transparent hover:!bg-transparent group",
                onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
              }, {
                default: () =>
                  sortType
                    ? h(ArrowUp, {
                        class:
                          cn('text-muted-foreground group-hover:text-foreground transition-transform',
                            sortType === 'asc' ? 'rotate-0' : 'rotate-180',)
                      })
                    : h(ArrowUpDown, { class: 'text-muted-foreground group-hover:text-foreground' }),
              }),
            ]
          }
        )
      },
      cell: ({getValue}) => {
        const typeGroup = getValue<string | CoreTokenType>()
        return h(
          Badge,
          {
            class: 'text-muted',
            style: { backgroundColor: groupColors[typeGroup] ?? '#787774' }
          },
          { default: () => typeGroup.charAt(0).toUpperCase() + typeGroup.slice(1) }
        )
      },
      enableSorting: true,
    }
  ]

  const metricsColumns: ColumnDef<ConceptData>[] = thrs.flatMap((thr) => {
    const thrId = thr === 0 ? thr.toFixed() : thr.toFixed(2)
    
    const makeColumns = (kind: MetricKey): ColumnDef<ConceptData> => ({
      id: `${kind}-${thrId}`,
      header: ({ column }) => {
        const sortType = column.getIsSorted()
        return h(
          "div", {
            class: "flex flex-1 items-center justify-between gap-x-2 text-left"
          }, {
            default: () => [
              h(
                TextTooltip,
                { text: METRICS[kind].text },
                { default: () => `${METRICS[kind].label} @${thrId}` },
              ),
              h(Button, {
                size: "icon",
                class: "!justify-center !size-4 !p-0 !border-0 !shadow-none !bg-transparent hover:!bg-transparent group",
                onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
              }, {
                default: () =>
                  sortType
                    ? h(ArrowUp, {
                        class:
                          cn('text-muted-foreground group-hover:text-foreground transition-transform',
                            sortType === 'asc' ? 'rotate-0' : 'rotate-180',)
                      })
                    : h(ArrowUpDown, { class: 'text-muted-foreground group-hover:text-foreground' }),
              }),
            ]
          }
        )
      },
      accessorFn: (row: ConceptData) =>
        row.metrics.find((m) => m.thresh === thr)?.[METRICS[kind].key],
      cell: ({getValue}) => {
        const value = getValue<number | undefined>()
        return value === undefined ? "-"
          : value <= 1.0 ? value.toFixed(3)
          : value.toLocaleString()
      },
      enableSorting: true,
    })

    return [
      makeColumns("tp"), makeColumns("p"), makeColumns("r"), makeColumns("f1"),
    ]
  })
  
  return [
    ...baseColumns,
    ...metricsColumns,
    {
      accessorKey: "reviewed",
      header: () => h(
        TextTooltip,
        { text: "True if manually confirmed" },
        { default: () => "Reviewed" }
      ),
      cell: ({getValue}) => {
        const value = getValue<boolean>()
        return h(
          "div",
          { class: "flex justify-center" },
          { default: () => [h(
            value ? LucideCheck : LucideX,
            { class: cn('size-4', value ? 'text-[#2f8049]' : 'text-[#b94d56]') }
          )]}
      )}
    },
  ] as ColumnDef<ConceptData>[]
}