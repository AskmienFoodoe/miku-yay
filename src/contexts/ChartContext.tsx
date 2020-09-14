import React from 'react';
import { Chart } from '../common/Chart';

const ChartContext = React.createContext({chart: new Chart([])} as ChartContextValue)

type stateType = {
    chart: Chart
}

interface ChartContextValue {
    chart: Chart
    updateChart: (chart: Chart) => void
}

export class ChartStore extends React.Component<{}, stateType> {

    state = {
        chart: new Chart([])
    }

    updateChart = (chart: Chart) => {
        this.setState({ chart: chart })
    }

    render() {
        const contextValue: ChartContextValue = {
            chart: this.state.chart,
            updateChart: this.updateChart
        }

        return (
            <ChartContext.Provider
                value={contextValue}
            >
                {this.props.children}
            </ChartContext.Provider>
        )
    }
}

export default ChartContext;