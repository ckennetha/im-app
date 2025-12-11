<script setup lang="ts">
import { ref, type Ref } from "vue"
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-vue-next"
import {
  type ColumnDef,
  type RowSelectionState,
  type Updater,
  FlexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useVueTable,
  getSortedRowModel,
} from "@tanstack/vue-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"
import { filterCoverageInBetween, filterTokenTypes, type FlatTokenActivation } from "./columns"

const { columns, data, isInSearchPage } = defineProps<{
  columns: ColumnDef<FlatTokenActivation>[];
  data: FlatTokenActivation[];
  isInSearchPage?: boolean;
}>()

// util
function handleRowSelectionChange(
  updaterOrValue: Updater<RowSelectionState> | RowSelectionState,
  seleRows: Ref<RowSelectionState>
) {
  seleRows.value = typeof updaterOrValue === "function"
    ? updaterOrValue(seleRows.value) : updaterOrValue
}

// state
const rowSelection = ref<RowSelectionState>({})

const table = useVueTable({
  get data() { return data },
  get columns() { return columns },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  filterFns: { filterCoverageInBetween, filterTokenTypes },
  getSortedRowModel: getSortedRowModel(),
  onRowSelectionChange: updaterOrValue => {
    handleRowSelectionChange(updaterOrValue, rowSelection)
  },
  initialState: {
    columnVisibility: {
      attrs: false,
      max: false,
      meanNonzero: false,
      meanAll: false,
      coverage: false,
      tokenTypes: false
    },
    columnPinning: { left: ['featureIdx'] },
    pagination: { pageSize: isInSearchPage ? 20 : 5 },
  },
  state: { get rowSelection() { return rowSelection.value } }
})

defineExpose({ table, rowSelection })
</script>

<template>
  <div :class="cn(isInSearchPage && 'border rounded-md')">
    <Table>
      <TableHeader>
        <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <TableHead v-for="(header, idx) in headerGroup.headers" :key="header.id"
            :class="cn(
              'h-9 [&:has([role=checkbox])]:!pr-2', { 'sticky bg-background/95': header.column.getIsPinned() },
              header.column.getIsPinned() === 'left' ? 'left-0' : 'right-0',
              isInSearchPage && idx === 0 ? 'rounded-tl-md' : '',
              isInSearchPage && idx === headerGroup.headers.length - 1 ? 'rounded-tr-md' : ''
            )"
          >
            <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="table.getRowModel().rows?.length">
          <TableRow v-for="row in table.getRowModel().rows" :key="row.id"
            :data-state="row.getIsSelected() ? 'selected' : undefined"
          >
            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id"
              :class="cn(
                'py-1.5', { 'sticky bg-background/95': cell.column.getIsPinned() },
                cell.column.getIsPinned() === 'left' ? 'left-0' : 'right-0',
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
    <div v-if="isInSearchPage" class="flex items-center justify-center m-1 space-x-1">
      <div class="flex flex-nowrap">
        <Button size="icon" class="!size-8 !shadow-none" :disabled="!table.getCanPreviousPage()"
          @click="table.firstPage()"
        >
          <ChevronFirst class="!size-5"/>
        </Button>
        <Button size="icon" class="!size-8 !shadow-none" :disabled="!table.getCanPreviousPage()"
          @click="table.previousPage()"
        >
          <ChevronLeft class="!size-5"/>
        </Button>
      </div>
      <span class="whitespace-nowrap text-sm">
        {{ table.getState().pagination.pageIndex + 1 }} / {{ table.getPageCount() }}
      </span>
      <div class="flex flex-nowrap">
        <Button size="icon" class="!size-8 !shadow-none" :disabled="!table.getCanNextPage()"
          @click="table.nextPage()"
        >
          <ChevronRight class="!size-5"/>
        </Button>
        <Button size="icon" class="!size-8 !shadow-none" :disabled="!table.getCanNextPage()"
          @click="table.lastPage()"
        >
          <ChevronLast class="!size-5"/>
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(button[data-slot="checkbox"]) {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid oklch(0.922 0 0);
  box-shadow: 0 0 #0000;

  &[data-state="checked"],
  &[data-state="indeterminate"] {
    color: var(--secondary-foreground);
    background-color: var(--secondary);
  }

  &[data-state="indeterminate"] {
    opacity: 50%;
  }
}
</style>