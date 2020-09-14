import React from 'react'
import RangeSelector, { rangeSelectorState } from '../selectors/RangeSelector'
import { Form } from 'semantic-ui-react'
import { PlacementType, NoteType, RangeSelectorOption } from '../../common/enums'
import { BoundChartOperation, convertRangeToBeatRange } from '../../common/operations'
import { OperationWidget } from '../../common/OperationWidget'
import { Chart } from '../../common/Chart'
import deepEqual from 'deep-equal'
import { SlideNote } from '../../common/notes'

type propsType = {
    updateBoundOperation: (boundOperation: BoundChartOperation) => void
}

type stateType = {
    rangeState: rangeSelectorState,
}

export default class ReverseOperation extends React.Component<propsType, stateType> implements OperationWidget {

    state = {
        rangeState: {
            rangeSelectorOption: RangeSelectorOption.Note,
            start: 0,
            end: 0
        },
    }

    handleRangeChange = (rangeState: rangeSelectorState) => {
        this.setState({ rangeState: rangeState })
    }

    bindOperation = (rangeState: rangeSelectorState) => {
        return (chart: Chart) => {
            const { start, end } = convertRangeToBeatRange(chart, rangeState)
            const notesExcerpt = chart.cutNotesExcerpt(start, end)
            const notesStart = notesExcerpt.length ? notesExcerpt[0].beat : 0
            const notesEnd = notesExcerpt.length ? notesExcerpt[notesExcerpt.length-1].beat : 0
            const reversedNotes = notesExcerpt.map(note => {
                let newNote = Object.assign({}, note)
                newNote.beat = notesStart + notesEnd - newNote.beat
                if (newNote.note === NoteType.Slide) {
                    const newSlideNote = newNote as SlideNote
                    newSlideNote.flick = false
                    if (newSlideNote.end) {
                        newSlideNote.end = false
                        newSlideNote.start = true
                    } else if (newSlideNote.start) {
                        newSlideNote.start = false
                        newSlideNote.end = true
                    }
                }
                return newNote
            })
            chart.addNotes(reversedNotes, notesStart, PlacementType.Place)
            return chart
        }
    }

    componentDidUpdate(prevProps: propsType, prevState: stateType) {
        if (!deepEqual(prevState, this.state, { strict: true })) {
            this.props.updateBoundOperation(this.bindOperation(this.state.rangeState))
        }
    }

    render() {
        return (
            <Form.Input>
                <RangeSelector onRangeChange={this.handleRangeChange} />
            </Form.Input>
        )
    }
}