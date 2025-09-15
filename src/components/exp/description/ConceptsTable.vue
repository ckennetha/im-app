<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { createConceptColumns, type ConceptData } from "./columns"
import { cn } from "@/lib/utils"

import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
  getSortedRowModel,
} from "@tanstack/vue-table"
import type { SortingState, Updater } from "@tanstack/vue-table"
import { ref, type Ref } from "vue"

const { data } = defineProps<{ data: ConceptData[] }>()

// create columns
const columns = createConceptColumns(data)

// sort state
const sorting = ref<SortingState>([])

const table = useVueTable({
  get data() { return data },
  get columns() { return columns },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
  initialState: {
    columnPinning: { left: ['concept'] },
  },
  state: {
    get sorting() { return sorting.value },
  }
})

const tableLength = table.getRowModel().rows.length

// utils
function valueUpdater<T extends Updater<any>>(updaterOrValue: T, ref: Ref) {
  ref.value = typeof updaterOrValue === 'function'
    ? updaterOrValue(ref.value)
    : updaterOrValue
}
</script>

<template>
  <div class="border rounded-md">
    <Table>
      <TableHeader>
        <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <TableHead v-for="header in headerGroup.headers" :key="header.id"
            :class="cn(
              'h-9', { 'sticky bg-background/95': header.column.getIsPinned() },
              header.column.getIsPinned() === 'left' ? 'left-0 rounded-tl-md'
                : header.column.getIsPinned() === 'right' ? 'right-0 rounded-tr-md'
                : '',
              header.column.id === 'reviewed' && 'text-center',
            )"
          >
            <FlexRender
              v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="table.getRowModel().rows?.length">
          <TableRow
            v-for="(row, rowIdx) in table.getRowModel().rows" :key="row.id"
            :data-state="row.getIsSelected() ? 'selected' : undefined"
          >
            <TableCell
              v-for="cell in row.getVisibleCells()" :key="cell.id"
              :class="cn(
                'py-1.5', { 'sticky bg-background/95': cell.column.getIsPinned() },
                cell.column.getIsPinned() === 'left'
                  ? (rowIdx === tableLength - 1 ? 'left-0 rounded-bl-md' : 'left-0')
                  : (rowIdx === tableLength - 1 ? 'right-0 rounded-br-md' : 'right-0'),
              )"
            >
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </TableCell>
          </TableRow>
        </template>
        <template v-else>
          <TableRow>
            <TableCell :colspan="columns.length" class="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>