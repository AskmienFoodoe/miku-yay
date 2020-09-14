import { ChartOperationBinder, BoundChartOperation } from "./operations";

export interface OperationWidget {
    props: OperationWidgetProps
    bindOperation: ChartOperationBinder
}

export interface OperationWidgetProps {
    updateBoundOperation: (boundOperation: BoundChartOperation) => void
}