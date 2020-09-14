import { ChartElementType } from "./enums";

import { ChartElement } from './ChartElement'

export class BpmMarker implements ChartElement {
    type: ChartElementType = ChartElementType.System
    cmd: string = 'BPM'
    bpm: number
    beat: number

    constructor({ bpm, beat }: { bpm: number, beat: number }) {
        this.bpm = bpm
        this.beat = beat
    }
}