import React from 'react'
import RangeSelector, { rangeSelectorState } from '../selectors/RangeSelector'
import { Label, Form } from 'semantic-ui-react'
import PlacementTypeSelector from '../selectors/PlacementTypeSelector'
import PositionSelector, { positionSelectorState } from '../selectors/PositionSelector'
import { PlacementType, RangeSelectorOption, PositionSelectorOption } from '../../common/enums'
import { BoundChartOperation, convertRangeToBeatRange, convertPositionToBeatPosition } from '../../common/operations'
import { OperationWidget } from '../../common/OperationWidget'
import { Chart } from '../../common/Chart'
import deepEqual from 'deep-equal'

type propsType = {
    updateBoundOperation: (boundOperation: BoundChartOperation) => void
}

type stateType = {
    rangeState: rangeSelectorState,
    positionState: positionSelectorState,
    placementType: PlacementType
}

export default class MoveOperation extends React.Component<propsType, stateType> implements OperationWidget {

    state = {
        rangeState: {
            rangeSelectorOption: RangeSelectorOption.Note,
            start: 0,
            end: 0
        },
        positionState: {
            positionSelectorOption: PositionSelectorOption.Note,
            position: 0
        },
        placementType: PlacementType.Place
    }

    handleRangeChange = (rangeState: rangeSelectorState) => {
        this.setState({ rangeState: rangeState })
    }

    handlePlacementTypeChange = (placementType: PlacementType) => {
        this.setState({ placementType: placementType })
    }

    handlePositionChange = (positionState: positionSelectorState) => {
        this.setState({ positionState: positionState })
    }

    bindOperation = (rangeState: rangeSelectorState, positionState: positionSelectorState, placementType: PlacementType) => {
        return (chart: Chart) => {
            const { start, end } = convertRangeToBeatRange(chart, rangeState)
            const notesExcerpt = chart.cutNotesExcerpt(start, end)
            const notesStart = notesExcerpt.length ? notesExcerpt[0].beat : 0
            const position = convertPositionToBeatPosition(chart, positionState, notesStart)
            chart.addNotes(notesExcerpt, position, placementType)
            return chart
        }
    }

    componentDidUpdate(prevProps: propsType, prevState: stateType) {
        if (!deepEqual(prevState, this.state, { strict: true })) {
            const { rangeState, positionState, placementType } = this.state
            this.props.updateBoundOperation(this.bindOperation(rangeState, positionState, placementType))
        }
    }

    render() {
        return (
            <Form.Input>
                <RangeSelector onRangeChange={this.handleRangeChange} />
                <Label style={{ fontSize: '16px' }} basic>and</Label>
                <PlacementTypeSelector onPlacementTypeChange={this.handlePlacementTypeChange} />
                <Label style={{ fontSize: '16px' }} basic>at</Label>
                <PositionSelector onPositionChange={this.handlePositionChange} />
            </Form.Input>
        )
    }
}