import { Note } from '../Note'

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

export function susToEntities(inputFile: string) {
    const parsedInput = inputFile.split('\n').map(line => line.trim())

    const notesSection = parsedInput.slice(parsedInput.findIndex(line => line.startsWith('#MEASUREHS')) + 2)
    const bpm = parseInt(parsedInput.find(line => line.startsWith('#BPM01: '))!.slice(8), 10)

    let notes: Note[] = [];
    let holds0: Note[] = [];
    let holds1: Note[] = [];

    //Reading input
    for (const line of notesSection) {
        try {
            const [pre, post] = line.slice(1).split(':')

            //Parsing pre
            const seg = parseInt(pre.slice(0, 3))
            const type = parseInt(pre.slice(3, 4))
            console.log(type)
            const lane = parseInt(pre.slice(4, 5), 16)
            const id = pre.length === 6 ? parseInt(pre.slice(5, 6)) : undefined

            //Parsing post
            for (let i = 0; i < post.length; i += 2) {
                let ntype = parseInt(post.slice(i, i + 1))
                const size = parseInt(post.slice(i + 1, i + 2), 16)

                if ((type === 1 && ntype > 2) || (type === 5 && (ntype === 2 || ntype > 4))) {
                    ntype = 0
                }

                if (ntype !== 0 && size !== 0 && lane < 15) {
                    //Fixed precision to 4 decimals to match original, might change this
                    const time = parseFloat(((240 / bpm) * (seg + i / post.length)).toFixed(4))

                    if (id === 0) {
                        holds0.push(new Note(time, (2 * type) + ntype, lane, size, id))
                    } else if (id === 1) {
                        holds1.push(new Note(time, (2 * type) + ntype, lane, size, id))
                    } else {
                        notes.push(new Note(time, type, lane, size, 0))
                    }
                }
            }
        } catch(error) {

        }        
    }

    //Sort notes
    const comparator = (first: Note, second: Note) => (first.time - second.time) * 1000000 + (first.lane - second.lane) * 10 + (second.type - first.type)
    notes = notes.sort(comparator)
    holds0 = holds0.sort(comparator)
    holds1 = holds1.sort(comparator)

    //Remove duplicates
    notes = notes.reduce((notesToKeep, currentNote) => {
        if (notesToKeep.some(note => note.type === 4 && note.time === currentNote.time && note.lane === currentNote.lane)) {
            //Do nothing, exclude the note
        } else {
            notesToKeep.push(currentNote)
        }
        return notesToKeep
    }, [] as Note[]);

    ({ newNotes: notes, newHolds: holds0 } = holdClear(notes, holds0));
    ({ newNotes: notes, newHolds: holds1 } = holdClear(notes, holds1));

    const chart = notes.concat(holds0).concat(holds1).sort(comparator)

    let holdsPos = [0,0]

    chart.forEach((note, index) => {
        const id = note.id
        if ([5,6,7].includes(note.type)) {
            note.id = holdsPos[id] + 2
        }
        if ([3,5].includes(note.type)) {
            holdsPos[id] = index
        }
    })

    const chartJson = chart.map((note, index) => {
        const data = {
            index: 0,
            values: [] as number[]
        }
        if (note.type > 3) {
            data.values.push(note.id)
        } else {
            data.index++
        }
        data.values.push(note.time)
        data.values.push(note.lane)
        data.values.push(note.size)
        return {
            archetype: note.type,
            data
        }
    })

    return chartJson
}