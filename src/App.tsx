import React from 'react';
import ChartComponent from './components/ChartComponent';
import DATA from "./mock-data.json"

import { saveData } from './DataStorage';
import { ChartDataResponse } from './type';

const App: React.FC = () => {
    const initialData : ChartDataResponse= DATA

    React.useEffect(() => {
        saveData(initialData);
    }, []);

    return (
        <div>
            <h1 style={{textAlign:"center", color:"#36454F"}}>Stackable Line Chart</h1>
            <ChartComponent />
        </div>
    );
};

export default App;
