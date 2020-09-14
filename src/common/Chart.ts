import { ChartElement } from "./ChartElement";
import { ChartElementType, NoteType, PlacementType, SlideNotePos } from "./enums";
import { Note, SingleNote, SlideNote } from "./notes";
import { BpmMarker } from "./BpmMarker";

export class Chart {

    chartElements: ChartElement[]
    numNotes: number
    initialBpm: number = 0

    constructor(chartElements: ChartElement[]) {

        let lastLongPos = SlideNotePos.B
        let isAFree = true
        let isBFree = true
        let lastALongLane: number = -1
        let lastBLongLane: number = -1

        this.chartElements = chartElements.map((element: ChartElement) => {
            if (element.type === ChartElementType.Note) {
                let note = element as Note
                if (note.note === NoteType.Single) {
                    return new SingleNote(note)
                } else if (note.note === NoteType.Slide) {
                    let slideNote = note as SlideNote
                    //Slide pos should also be checked
                    if (slideNote.start) {
                        if (slideNote.pos === SlideNotePos.A) {
                            isAFree = false
                        } else if (slideNote.pos === SlideNotePos.B) {
                            isBFree = false
                        }
                    } else if (slideNote.end) {
                        if (slideNote.pos === SlideNotePos.A) {
                            isAFree = true
                        } else if (slideNote.pos === SlideNotePos.B) {
                            isBFree = true
                        }
                    }
                    return new SlideNote(slideNote)
                } else if (note.note === NoteType.Long) {
                    let longNote = note as SlideNote
                    if (longNote.start === true) {
                        //Handles the edge case where a Long starts on the same beat as a Slide
                        const concurrentSlides = chartElements.filter((element) => element.beat === longNote.beat && (element as Note).note === NoteType.Slide) as SlideNote[]
                        if (concurrentSlides.length) {
                            if (concurrentSlides[0].pos === SlideNotePos.A) {
                                longNote.pos = SlideNotePos.B
                                lastBLongLane = longNote.lane
                                isBFree = false
                            } else if (concurrentSlides[0].pos === SlideNotePos.B) {
                                longNote.pos = SlideNotePos.A
                                lastALongLane = longNote.lane
                                isAFree = false
                            }
                        }
                        //Prioritizes alternating pos if possible
                        else if (lastLongPos === SlideNotePos.A) {
                            if (isBFree) {
                                longNote.pos = SlideNotePos.B
                                lastBLongLane = longNote.lane
                                isBFree = false
                            } else if (isAFree) {
                                longNote.pos = SlideNotePos.A
                                lastALongLane = longNote.lane
                                isAFree = false
                            }
                        } else if (lastLongPos === SlideNotePos.B) {
                            if (isAFree) {
                                longNote.pos = SlideNotePos.A
                                lastALongLane = longNote.lane
                                isAFree = false
                            } else if (isBFree) {
                                longNote.pos = SlideNotePos.B
                                lastBLongLane = longNote.lane
                                isBFree = false
                            }
                        }
                        lastLongPos = longNote.pos
                    } else if (longNote.end === true) {
                        if (longNote.lane === lastALongLane) {
                            longNote.pos = SlideNotePos.A
                            lastALongLane = -1
                            isAFree = true
                        } else if (longNote.lane === lastBLongLane) {
                            longNote.pos = SlideNotePos.B
                            lastBLongLane = -1
                            isBFree = true
                        }
                    }
                    return new SlideNote(longNote)
                }
            } else if (element.type === ChartElementType.System) {
                let bpmMarker = element as BpmMarker
                if (bpmMarker.cmd === 'BPM') {
                    if (!this.initialBpm) {
                        this.initialBpm = bpmMarker.bpm
                    }
                    return new BpmMarker(bpmMarker)
                }
            }
            return {} as ChartElement //Ripperino in Pepperino
        }).filter(element => Object.keys(element).length)
        this.numNotes = this.getNotes().length
    }

    getNotes(): Note[] {
        return this.chartElements.filter(element => element.type === ChartElementType.Note).sort((a, b) => a.beat - b.beat) as Note[]
    }

    //Ignores BPM markers
    //Any space with no notes on the tails is trimmed, so the range of the excerpt is based on the first and last notes, not startBeat and endBeat
    private extractNotesExcerpt(startBeat: number, endBeat: number, cut: boolean): Note[] {
        const filterLogic = (element: ChartElement) => {
            return element.type === ChartElementType.Note && element.beat >= startBeat && element.beat <= endBeat
        }

        const excerpt = this.chartElements.filter(filterLogic)
        if (cut) {
            this.chartElements = this.chartElements.filter(element => !filterLogic(element))
        }
        return excerpt as Note[]
    }

    cutNotesExcerpt(startBeat: number, endBeat: number): Note[] {
        return this.extractNotesExcerpt(startBeat, endBeat, true)
    }

    copyNotesExcerpt(startBeat: number, endBeat: number): Note[] {
        return this.extractNotesExcerpt(startBeat, endBeat, false)
    }

    addNotes(notes: Note[], beatPosition: number, placementType: PlacementType): Chart {
        if (!notes.length) {
            return this
        }

        const sortedNotes = notes.sort((a, b) => a.beat - b.beat)
        const firstBeat = sortedNotes[0].beat
        const normalizedNotes = sortedNotes.map(note => {
            let newNote = Object.assign({}, note)
            newNote.beat = newNote.beat - firstBeat
            return newNote
        })
        const range = normalizedNotes[normalizedNotes.length - 1].beat
        const positionedNotes = normalizedNotes.map(note => {
            let newNote = Object.assign({}, note)
            newNote.beat = newNote.beat + beatPosition
            return newNote
        })

        switch (placementType) {
            case PlacementType.Place:
                break
            case PlacementType.Replace:
                this.chartElements = this.chartElements.filter(element => element.type !== ChartElementType.Note ||
                                                                          element.beat > beatPosition + range || 
                                                                          element.beat < beatPosition)
                break
            //Insert DOES also displace BPM Markers
            case PlacementType.Insert:
                this.chartElements = this.chartElements.map(element => {
                    let newElement = Object.assign({}, element)
                    if (newElement.beat >= beatPosition) {
                        newElement.beat += range
                    }
                    return newElement
                })
                break
        }
        this.chartElements = this.chartElements.concat(positionedNotes).sort((a, b) => a.beat - b.beat) as Note[]
        
        return new Chart(this.chartElements)
    }
}