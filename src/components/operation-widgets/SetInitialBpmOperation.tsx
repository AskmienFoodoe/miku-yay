import React from 'react'
import { Form, Input, Label, InputOnChangeData } from 'semantic-ui-react'
import { ChartElementType } from '../../common/enums'
import { BoundChartOperation } from '../../common/operations'
import { OperationWidget } from '../../common/OperationWidget'
import { Chart } from '../../common/Chart'
import deepEqual from 'deep-equal'
import ChartContext from '../../contexts/ChartContext'
import { BpmMarker } from '../../common/BpmMarker'

type propsType = {
    updateBoundOperation: (boundOperation: BoundChartOperation) => void
}

type stateType = {
    bpm: number
}

export default class SetInitialBpmOperation extends React.Component<propsType, stateType> implements OperationWidget {

    static contextType = ChartContext
    context!: React.ContextType<typeof ChartContext>

    state = {
        bpm: 0
    }

    handleBpmChange = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
        this.setState({ bpm: Math.floor(+data.value) })
    }

    fixBpm = () => {
        if (this.state.bpm <= 0) {
            this.setState({ bpm: 1 })
        }
    }

    bindOperation = (bpm: number) => {
        return (chart: Chart) => {
            const bpmMarker = chart.chartElements.find(element => element.type === ChartElementType.System && element.beat === 0)
            if (bpmMarker) {
                (bpmMarker as BpmMarker).bpm = bpm
            } else {
                chart.chartElements.push(new BpmMarker({ bpm, beat: 0 }))
            }
            return chart
        }
    }

    componentDidMount() {
        const initialBpm = this.context.chart.initialBpm
        this.setState({ bpm: initialBpm ? initialBpm : 1  })
    }

    componentDidUpdate(prevProps: propsType, prevState: stateType) {
        if (!deepEqual(prevState, this.state, { strict: true })) {
            this.props.updateBoundOperation(this.bindOperation(this.state.bpm))
        }
    }

    render() {
        return (
            <Form.Input>
                <Label style={{ fontSize: '16px' }} basic>to</Label>
                <Input
                    style={{ width: '80px' }}
                    type='number'
                    min={0}
                    value={this.state.bpm}
                    onChange={this.handleBpmChange}
                    onBlur={this.fixBpm}
                />
            </Form.Input>
        )
    }
}