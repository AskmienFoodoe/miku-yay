import { Chart } from "../Chart"

export const bpmToSeconds = notes => {
    let spb = 0
    let accBeats = 0
    let accSeconds = 0
    const newNotes = new Chart(notes).chartElements

    newNotes.forEach(note => {
        note.time = accSeconds + (note.beat - accBeats) * spb
        if (note.cmd === 'BPM') {
            spb = 60 / note.bpm || 0
            accBeats = note.beat
            accSeconds = note.time
        }
    })

    return newNotes
}

export const convert = notes => {
    notes = notes.filter(object => object.type === 'Note')
    notes.forEach((note, index) => {
        switch (note.note) {
            case 'Long':
                if (!note.start) {
                    note.head = findLongPrev(notes, note, index)
                }
                break
            case 'Slide':
                if (!note.start) {
                    note.head = findSlidePrev(notes, note, index)
                }
                break
            default:
                break
        }
    })

    const getFreedom = note => 3 - Math.abs(note.lane - 4)
    notes.sort((a, b) => a.time - b.time || getFreedom(a) - getFreedom(b))

    let slides = []
    notes.forEach((note, index) => {
        note.index = index + 2
        note.lane -= 4
        switch (note.note) {
            case 'Single':
                note.archetype = note.flick ? 4 : 2
                break
            case 'Long':
                note.archetype = note.start ? 3 : note.flick ? 7 : 6
                break
            case 'Slide':
                note.archetype = note.start ? 3 : note.end ? (note.flick ? 7 : 6) : 5
                break
            default:
                break
        }

        switch (note.archetype) {
            case 3:
                slides.push([note.index])
                break
            case 5:
                slides.find(slide => slide.includes(note.head.index)).push(note.index)
                break
            case 6:
            case 7:
                slides = slides.filter(slide => !slide.includes(note.head.index))
                break
            default:
                break
        }

        if (notes[index - 1] && notes[index - 1].time === note.time) {
            note.ref = notes[index - 1].index
        } else {
            if (!notes[index + 1] || notes[index + 1].time !== note.time) {
                const slide = slides.find(
                    slide => !slide.includes(note.index) && (!note.head || !slide.includes(note.head.index))
                )
                if (slide) {
                    note.ref = slide[slide.length - 1]
                }
            }
        }
    })

    const entities = notes.map(note => {
        const data = {
            index: 0,
            values: [],
        }
        if (note.head) {
            data.values.push(note.head.index)
        } else {
            data.index++
        }
        data.values.push(note.time)
        data.values.push(note.lane)
        if (note.ref) {
            data.values.push(note.ref)
        }
        return {
            archetype: note.archetype,
            data,
        }
    })

    return entities
}

function findLongPrev(notes, note, index) {
    for (let i = index - 1; i >= 0; i--) {
        const n = notes[i]
        if (n.time < note.time && n.note === 'Long' && n.lane === note.lane) {
            return n
        }
    }
}

function findSlidePrev(notes, note, index) {
    for (let i = index - 1; i >= 0; i--) {
        const n = notes[i]
        if (n.time < note.time && n.note === 'Slide' && n.pos === note.pos) {
            return n
        }
    }
}
