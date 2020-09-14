import React from 'react';
import ReactDOM from 'react-dom';
import { ChartStore } from './contexts/ChartContext'
import AppRouter from './components/AppRouter';
import { LocalStorageStore } from './contexts/LocalStorageContext';

ReactDOM.render(
  <React.StrictMode>
    <LocalStorageStore>
      <ChartStore>  
        <AppRouter />  
      </ChartStore>
    </LocalStorageStore>
  </React.StrictMode>,
  document.getElementById('root')
);