import { useMemo } from 'react'
import { clamp } from '../helpers/utils'
import type { CSSProperties } from 'react'

export const getAspect = (w = 16, h = 16, d = 16) => {
        w = clamp(Math.hypot(w, d), 1, 2048)
        h = clamp(h, 1, 2048)
        return clamp(w / h, 0.618, 1.618)
}

type Item = { width: number | null; height: number | null; depth: number | null }

export const GAP = 16

export type MasonryLayout = {
        styles: CSSProperties[]
        height: number
        columns: number
        colWidth: number
        lefts: number[]
        heights: number[]
        gap: number
}

const placeMasonry = (col: number, colW: number, gap: number, lefts: number[], baseHeights: number[], itemHeights: number[]) => {
        const heights = baseHeights.slice()
        const styles = new Array(itemHeights.length) as CSSProperties[]
        for (let i = 0; i < itemHeights.length; i++) {
                const h = itemHeights[i]
                let pick = 0
                let min = heights[0]
                for (let c = 1; c < col; c++) {
                        const v = heights[c]
                        if (v < min - 1e-6) {
                                min = v
                                pick = c
                        }
                }
                const x = lefts[pick]
                const y = min
                styles[i] = { transform: `translate(${x}px, ${y}px)`, width: colW, height: h }
                heights[pick] = min + h + gap
        }
        return { styles, heights }
}

const placeMasonryAssigned = (col: number, colW: number, gap: number, lefts: number[], baseHeights: number[], itemHeights: number[], assignments: number[]) => {
        const heights = baseHeights.slice()
        const styles = new Array(itemHeights.length) as CSSProperties[]
        for (let i = 0; i < itemHeights.length; i++) {
                let pick = assignments[i]
                if (pick < 0 || pick >= col) pick = 0
                const h = itemHeights[i]
                const x = lefts[pick]
                const y = heights[pick]
                styles[i] = { transform: `translate(${x}px, ${y}px)`, width: colW, height: h }
                heights[pick] = y + h + gap
        }
        return { styles, heights }
}

const containerHeight = (heights: number[], gap: number, cardCount: number) => {
        const max = heights.reduce((acc, v) => Math.max(acc, v), 0)
        let subtract = 0
        if (cardCount > 0) subtract = gap
        return Math.max(0, max - subtract)
}

export const useMasonries = <T extends Item>(items: T[], width: number, isLogin = false): MasonryLayout => {
        return useMemo(() => {
                const isSP = width < 800
                let col = 3
                if (isSP) col = 1
                else if (width < 1536) col = 2
                let offset = 32
                if (isSP) offset = 43
                else {
                        if (isLogin) offset = 138
                        else offset = 75
                }
                const w = width - offset
                const inner = Math.max(0, w) - GAP * (col - 1)
                const colW = inner > 0 ? inner / col : 0
                const heights = new Array(col).fill(0) as number[]
                const lefts = new Array(col).fill(0).map((_, i) => i * (colW + GAP))
                const itemHeights = items.map((it) => {
                        const a = getAspect(it.width || 16, it.height || 16, it.depth || 16)
                        return colW / a
                })
                const placed = placeMasonry(col, colW, GAP, lefts, heights, itemHeights)
                const height = containerHeight(placed.heights, GAP, items.length)
                return { styles: placed.styles, height, columns: col, colWidth: colW, lefts, heights: placed.heights, gap: GAP }
        }, [items, width])
}

const PLACEHOLDER_BASE_ASPECTS = [0.92, 0.98, 1.04, 1.1, 1.16, 1.22, 1.28, 1.12, 1.06, 1.18]

const placeholderAspects = (count: number) => {
        const arr = new Array(count)
        for (let i = 0; i < count; i++) arr[i] = PLACEHOLDER_BASE_ASPECTS[i % PLACEHOLDER_BASE_ASPECTS.length]
        return arr
}

const computePlaceholderLayout = (layout: MasonryLayout, count: number): { styles: CSSProperties[]; height: number } => {
        const aspects = placeholderAspects(count)
        const itemHeights = aspects.map((a) => (layout.colWidth > 0 ? layout.colWidth / a : 0))
        const placed = placeMasonry(layout.columns, layout.colWidth, layout.gap, layout.lefts, layout.heights, itemHeights)
        const totalCount = layout.styles.length + count
        const height = containerHeight(placed.heights, layout.gap, totalCount)
        return { styles: placed.styles, height }
}

export const usePlaceholder = (layout: MasonryLayout, options?: { count?: number; isNoMore?: boolean }): { styles: CSSProperties[]; height: number } => {
        const { count: _count, isNoMore } = options || {}
        return useMemo(() => {
                let count = _count as number

                // If no more pages, return current height without placeholders
                if (isNoMore) return { styles: [], height: layout.height }

                // Initial loading (explicit 6 placeholders)
                if (count === 6) {
                        if (layout.columns <= 1) return computePlaceholderLayout(layout, count)
                        // Interleaved assignment by rows to avoid one-sided stacking
                        const assignments: number[] = []
                        if (layout.columns === 2) {
                                // Two columns, 3 items each, varied heights per column but equal column sum
                                // base height and per-column weights that sum to 3.0 each
                                const baseH = layout.colWidth / 1.15
                                const wL = [1.0, 0.86, 1.14] // sum 3.00
                                const wR = [1.08, 0.92, 1.0] // sum 3.00
                                const itemHeights: number[] = []
                                for (let i = 0; i < 3; i++) {
                                        // interleave L/R rows
                                        assignments.push(0)
                                        assignments.push(1)
                                        itemHeights.push(baseH * wL[i])
                                        itemHeights.push(baseH * wR[i])
                                }
                                const placed = placeMasonryAssigned(layout.columns, layout.colWidth, layout.gap, layout.lefts, layout.heights, itemHeights, assignments)
                                const total = layout.styles.length + itemHeights.length
                                const height = containerHeight(placed.heights, layout.gap, total)
                                return { styles: placed.styles, height }
                        }
                        if (layout.columns >= 3) {
                                // Three columns, 2 items each, varied heights per column but equal column sum
                                const baseH = layout.colWidth / 1.18
                                const w0 = [1.0, 1.1] // sum 2.10
                                const w1 = [1.05, 1.05] // sum 2.10
                                const w2 = [1.12, 0.98] // sum 2.10
                                const itemHeights: number[] = []
                                for (let i = 0; i < 2; i++) {
                                        assignments.push(0)
                                        assignments.push(1)
                                        assignments.push(2)
                                        itemHeights.push(baseH * w0[i])
                                        itemHeights.push(baseH * w1[i])
                                        itemHeights.push(baseH * w2[i])
                                }
                                const placed = placeMasonryAssigned(3, layout.colWidth, layout.gap, layout.lefts, layout.heights, itemHeights, assignments)
                                const total = layout.styles.length + itemHeights.length
                                const height = containerHeight(placed.heights, layout.gap, total)
                                return { styles: placed.styles, height }
                        }
                }

                // Load more placeholders (default count 3) with balancing for columns >= 2
                if (layout.columns >= 2) {
                        const heights = layout.heights
                        let max = heights[0]
                        for (let i = 1; i < heights.length; i++) if (heights[i] > max) max = heights[i]
                        const lift = layout.colWidth / 12
                        const target = max + lift
                        const assignments: number[] = []
                        const itemHeights: number[] = []
                        if (layout.columns === 2) {
                                let minIdx = 0
                                if (heights[1] < heights[0]) minIdx = 1
                                let maxIdx = 1 - minIdx
                                const d0 = target - heights[minIdx]
                                const d1 = target - heights[maxIdx]
                                const half = d0 / 2
                                // two to shorter column, one to taller column
                                assignments.push(minIdx, minIdx, maxIdx)
                                itemHeights.push(half, d0 - half, d1)
                        } else {
                                // columns === 3 (use first 3 columns)
                                for (let c = 0; c < 3; c++) {
                                        assignments.push(c)
                                        const need = target - heights[c]
                                        itemHeights.push(need)
                                }
                        }
                        for (let i = 0; i < itemHeights.length; i++) if (itemHeights[i] < 8) itemHeights[i] = 8
                        const placed = placeMasonryAssigned(layout.columns, layout.colWidth, layout.gap, layout.lefts, layout.heights, itemHeights, assignments)
                        const total = layout.styles.length + assignments.length
                        const height = containerHeight(placed.heights, layout.gap, total)
                        return { styles: placed.styles, height }
                }

                // fallback (single column or unspecified)
                return computePlaceholderLayout(layout, count)
        }, [layout.columns, layout.colWidth, layout.lefts, layout.heights, layout.gap, layout.styles.length, _count, isNoMore])
}
