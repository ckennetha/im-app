<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

import {
  filterCoverageInBetween,
  filterTokenTypes,
  type FlatFeatureActivations
} from "./columns"
import {
  FlexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useVueTable,
  getSortedRowModel,
  type ColumnDef,
} from "@tanstack/vue-table"

import { cn } from "@/lib/utils"
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-vue-next"

const { columns, data, isInSearch } = defineProps<{
  columns: ColumnDef<FlatFeatureActivations>[];
  data: FlatFeatureActivations[];
  isInSearch?: boolean;
}>()

const table = useVueTable({
  get data() { return data },
  get columns() { return columns },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  filterFns: { filterCoverageInBetween, filterTokenTypes },
  getSortedRowModel: getSortedRowModel(),
  initialState: {
    columnVisibility: {
      dataMax: false,
      dataMeanNonzero: false,
      dataMeanAll: false,
      dataCoverage: false,
      dataTokenTypes: false
    },
    columnPinning: { left: ['featureIdx'] },
    pagination: { pageSize: isInSearch ? 20 : 5 },
  }
})
</script>

<template>
  <div :class="cn(isInSearch && 'border rounded-md')">
    <Table>
      <TableHeader>
        <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <TableHead v-for="header in headerGroup.headers" :key="header.id"
            :class="cn(
              'h-9', { 'sticky bg-background/95': header.column.getIsPinned() },
              header.column.getIsPinned() === 'left' ? 'left-0' : 'right-0',
              header.column.getIsPinned() === 'left' && isInSearch ? 'rounded-tl-md' : 'rounded-tr-md'
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
            v-for="row in table.getRowModel().rows" :key="row.id"
            :data-state="row.getIsSelected() ? 'selected' : undefined"
          >
            <TableCell
              v-for="cell in row.getVisibleCells()" :key="cell.id"
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
    <div v-if="isInSearch" class="flex items-center justify-center m-1 space-x-1">
      <div class="flex flex-nowrap">
        <Button
          size="icon"
          class="!size-8 !shadow-none"
          :disabled="!table.getCanPreviousPage()"
          @click="table.firstPage()"
        >
          <ChevronFirst class="!size-5"/>
        </Button>
        <Button
          size="icon"
          class="!size-8 !shadow-none"
          :disabled="!table.getCanPreviousPage()"
          @click="table.previousPage()"
        >
          <ChevronLeft class="!size-5"/>
        </Button>
      </div>
      <span class="whitespace-nowrap text-sm">
        {{ table.getState().pagination.pageIndex + 1 }} /
        {{ table.getPageCount() }}
      </span>
      <div class="flex flex-nowrap">
        <Button
          size="icon"
          class="!size-8 !shadow-none"
          :disabled="!table.getCanNextPage()"
          @click="table.nextPage()"
        >
          <ChevronRight class="!size-5"/>
        </Button>
        <Button
          size="icon"
          class="!size-8 !shadow-none"
          :disabled="!table.getCanNextPage()"
          @click="table.lastPage()"
        >
          <ChevronLast class="!size-5"/>
        </Button>
      </div>
    </div>
  </div>
</template>