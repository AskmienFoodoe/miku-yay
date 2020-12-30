import { Note } from '../Note'
import { BPM, ChartElement, TimeSignature } from '../types'

function holdClear(notes: Note[], holds: Note[]) {
    const newHolds = holds.map(hold => {
        if (notes.some(note => note.type === 4 && note.time === hold.time && note.lane === hold.lane)) {
            hold.type = 7
        }
        return hold
    })

    const newNotes = notes.filter(note => !(
        holds.some(hold => note.time === hold.time && note.lane === hold.lane) &&
        (note.type === 2 || note.type === 4)
    ))

    return { newNotes, newHolds }
}

function MeasuresToBeats(chart: ChartElement[]) {
    let beatsPerMeasure = 0
    let totalMeasures = 0
    let totalBeats = 0

    chart.forEach(chartElement => {
        chartElement.beat = totalBeats + (chartElement.measure - totalMeasures) * beatsPerMeasure
        if ((chartElement as TimeSignature).quarterNotesPerMeasure) {
            beatsPerMeasure = (chartElement as TimeSignature).quarterNotesPerMeasure
            totalMeasures = chartElement.measure
            totalBeats = chartElement.beat
        }
    })

    return chart
}

function BeatsToSeconds(chart: ChartElement[]) {
    let secondsPerBeat = 0
    let totalBeats = 0
    let totalSeconds = 0

    chart.forEach(chartElement => {
        chartElement.time = totalSeconds + (chartElement.beat || 0 - totalBeats) * secondsPerBeat
        if ((chartElement as BPM).bpm) {
            secondsPerBeat = 60 / (chartElement as BPM).bpm || 0
            totalBeats = chartElement.beat || totalBeats
            totalSeconds = chartElement.time
        }
    })

    return chart
}

export function susToEntities(inputFile: string, offset: number = 0) {
    const parsedInput = inputFile.split('\n').map(line => line.trim())

    //Find and process time signatures
    const timeSignatureSection = parsedInput.filter(line => !line.startsWith('#BPM') && line.slice(4, 6) === '02')

    //Find BPMs
    const bpmValues = parsedInput.filter(line => line.startsWith('#BPM'))
        .map(bpmLine => parseInt(bpmLine.slice(8), 10))
    const bpmSection = parsedInput.filter(line => !line.startsWith('#BPM') && line.slice(4, 6) === '08')

    //Find notes
    const notesSection = parsedInput.slice(parsedInput.findIndex(line => line.startsWith('#MEASUREHS')) + 2)
    const timeSignatures: TimeSignature[] = []
    const bpmMarkers: BPM[] = []
    let notes: Note[] = []
    let holds0: Note[] = []
    let holds1: Note[] = []
    for (const line of timeSignatureSection.concat(bpmSection).concat(notesSection)) {
        try {
            const [pre, post] = line.slice(1).split(':')

            //Parsing pre
            const seg = parseInt(pre.slice(0, 3))
            const type = parseInt(pre.slice(3, 4))
            const lane = parseInt(pre.slice(4, 5), 16)
            const id = pre.length === 6 ? parseInt(pre.slice(5, 6)) : undefined

            //Parsing post for time signatures
            if (type === 0 && lane === 2) {
                const quarterNotesPerMeasure = parseInt(post)
                timeSignatures.push({ quarterNotesPerMeasure: quarterNotesPerMeasure, measure: seg })
            } 
            //Parsing post for BPMs
            else if(type === 0 && lane === 8) {
                const shiftedPost  = post.slice(1)
                for (let i = 0; i < shiftedPost.length; i += 2) {
                    const id = parseInt(shiftedPost.substr(i, 2), 36)   
                    if (id !== 0) {
                        const measure = seg + i / shiftedPost.length
                        bpmMarkers.push({ bpm: bpmValues[id - 1], measure })
                    }
                }
            } 
            //Parsing post for notes
            else {
                for (let i = 0; i < post.length; i += 2) {
                    let ntype = parseInt(post.slice(i, i + 1))
                    const size = parseInt(post.slice(i + 1, i + 2), 16)
    
                    if ((type === 1 && ntype > 2) || (type === 5 && (ntype === 2 || ntype > 4))) {
                        ntype = 0
                    }
    
                    if (ntype !== 0 && size !== 0 && lane < 15) {
    
                        //Fixed precision to 4 decimals to match original, might change this
                        //Offset added to circumvent 9 seconds of silence
                        const measure = seg + i / post.length
    
                        if (id === 0) {
                            holds0.push(new Note(measure, (2 * type) + ntype, lane, size, id))
                        } else if (id === 1) {
                            holds1.push(new Note(measure, (2 * type) + ntype, lane, size, id))
                        } else {
                            notes.push(new Note(measure, type, lane, size, 0))
                        }
                    }
                }
            }            
        } catch (error) {
            console.log(error)
        }
    }

    //Sort notes
    const comparator = (first: Note, second: Note) => (first.measure - second.measure) * 1000000 + (first.lane - second.lane) * 10 + (second.type - first.type)
    notes = notes.sort(comparator)
    holds0 = holds0.sort(comparator)
    holds1 = holds1.sort(comparator)

    //Remove duplicates
    notes = notes.reduce((notesToKeep, currentNote) => {
        if (notesToKeep.some(note => note.type === 4 && note.measure === currentNote.measure && note.lane === currentNote.lane)) {
            //Do nothing, exclude the note
        } else {
            notesToKeep.push(currentNote)
        }
        return notesToKeep
    }, [] as Note[]);

    ({ newNotes: notes, newHolds: holds0 } = holdClear(notes, holds0));
    ({ newNotes: notes, newHolds: holds1 } = holdClear(notes, holds1));

    const chart: ChartElement[] = [...notes.concat(holds0).concat(holds1), ...bpmMarkers, ...timeSignatures].sort((a, b) => a.measure - b.measure)
    const notesOnly = BeatsToSeconds(MeasuresToBeats(chart)).filter(chartElement => (chartElement as Note).type !== undefined) as Note[]

    const holdsPos = [0, 0]

    notesOnly.forEach((note, index) => {
        const id = note.id
        if ([5, 6, 7].includes(note.type)) {
            note.id = holdsPos[id] + 2
        }
        if ([3, 5].includes(note.type)) {
            holdsPos[id] = index
        }
    })

    const chartJson = notesOnly.map((note) => {
        const data = {
            index: 0,
            values: [] as number[]
        }
        if (note.type > 3) {
            data.values.push(note.id)
        } else {
            data.index++
        }
        data.values.push(note.time || 0)
        data.values.push(note.lane)
        data.values.push(note.size)
        return {
            archetype: note.type,
            data
        }
    })

    return chartJson
}