import { Chart } from "./Chart";
import { RangeSelectorOption, PositionSelectorOption } from "./enums";

export interface ChartOperation {
    (chart: Chart, ...any: any[]): Chart
}

export interface BoundChartOperation extends ChartOperation {
    (chart: Chart): Chart
}

export interface ChartOperationBinder {
    (...any: any[]): BoundChartOperation
}

export function convertRangeToBeatRange(chart: Chart, { rangeSelectorOption, start, end }: { rangeSelectorOption: RangeSelectorOption, start: number, end: number }): { start: number, end: number } {
    switch (rangeSelectorOption) {
        case RangeSelectorOption.Beat:
            return { start: start, end: end }
        case RangeSelectorOption.Note:
            const notes = chart.getNotes()
            if (!notes.length) {
                return { start: 0, end: 0 }
            }
            const firstNoteIndex = Math.max(start - 1, 0)
            const lastNoteIndex = Math.max(Math.min(end - 1, notes.length - 1), 0)
            return { start: notes[firstNoteIndex].beat, end: notes[lastNoteIndex].beat }
    }
}

export function convertPositionToBeatPosition(chart: Chart, { positionSelectorOption, position }: { positionSelectorOption: PositionSelectorOption, position: number }, rangeStartAsBeatRange: number = 0): number {
    const notes = chart.getNotes()
    switch (positionSelectorOption) {
        case PositionSelectorOption.Beat:
            return position
        case PositionSelectorOption.Note:
            if (!notes.length) {
                return 0
            }
            const noteIndex = Math.max(Math.min(position - 1, notes.length - 1), 0)
            return notes[noteIndex].beat
        case PositionSelectorOption.Relative:
            return rangeStartAsBeatRange + position
    }
}