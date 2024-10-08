import React, { useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { loadData } from '../DataStorage';
import { ChartData, ChartDataResponse } from '../type';

const ChartComponent: React.FC = () => {
   const [chartData, setChartData] = useState<ChartData[]>([]);
   const [selectedColumns, setSelectedColumns] = useState<(keyof ChartData)[]>([]);
   const [interpolationValue, setInterpolationValue] = useState<number | null>(null);
   const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
   const chartRef = React.useRef<HTMLDivElement>(null);

   useEffect(() => {
      const data: ChartDataResponse | null = loadData();
      if (data) {
         setChartData(data.data);
      }
   }, []);

   useEffect(() => {
      if (chartRef.current) {
         const chartInstance = echarts.init(chartRef.current);
         const options = {
            tooltip: {
               trigger: 'axis',
               axisPointer: { type: 'cross' }
            },
            xAxis: {
               type: 'category',
               data: chartData.map(item => item.Date_Time),
               boundaryGap: false
            },
            yAxis: {
               type: 'value'
            },
            series: selectedColumns.map(column => ({
               name: column,
               type: 'line',
               data: chartData.map(item => item[column]),
               smooth: true,
               areaStyle: {}
            })),
            dataZoom: [
               {
                  type: 'inside',
                  start: 0,
                  end: 100
               },
               {
                  show: true,
                  type: 'slider',
                  left: '0%',
                  right: '0%',
                  bottom: '10%',
                  start: 0,
                  end: 100
               }
            ],
            grid: {
               top: 20,
               bottom: 50,
            }
         };
         chartInstance.setOption(options);
      }
   }, [chartData, selectedColumns]);

   const handleDragStart = (column: keyof ChartData, event: React.DragEvent) => {
      event.dataTransfer.setData('text/plain', column);
   };

   const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const column = event.dataTransfer.getData('text/plain') as keyof ChartData;
      if (column && !selectedColumns.includes(column)) {
         setSelectedColumns([...selectedColumns, column]);
      }
   };

   const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
   };

   const handleInterpolation = () => {
      if (interpolationValue !== null) {
         const newValue = interpolateValue(interpolationValue);
         if (chartRef.current) {
            const chartInstance = echarts.getInstanceByDom(chartRef.current);
            const newSeries = [
               ...selectedColumns.map(column => ({
                  name: column,
                  type: 'line',
                  data: chartData.map(item => item[column]),
                  smooth: true,
                  areaStyle: {}
               })),
               {
                  name: 'Interpolated Value',
                  type: 'line',
                  data: newValue,
                  smooth: true,
                  areaStyle: {}
               }
            ];
            chartInstance?.setOption({ series: newSeries });
         }
      }
   };

   const interpolateValue = (value: number) => {
      return chartData.map(item => item["10_Min_Sampled_Avg"] + value);
   };

   const saveChartAsImage = () => {
      if (chartRef.current) {
         const chartInstance = echarts.getInstanceByDom(chartRef.current);
         const dataURL = chartInstance?.getDataURL({
            type: 'png',
            pixelRatio: 2,
            backgroundColor: '#fff'
         });
         if (dataURL) {
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = 'chart.png';
            link.click();
         } else {
            console.error('Failed to generate chart image.');
         }
      }
   };

   return (
      <div>
         <div style={{ display: "flex", justifyContent: "space-between", marginBottom: '20px' }}>
            <div style={{ display: "flex", gap: 5, alignItems: "center", marginLeft: "3rem" }}>
               <div>Draggable Item(s)</div>
               {['10_Min_Std_Dev', '10_Min_Sampled_Avg', 'Time'].map((item) => (
                  <div
                     key={item}
                     draggable
                     onDragStart={(e) => handleDragStart(item as keyof ChartData, e)}
                     onMouseEnter={() => setHoveredColumn(item)}
                     onMouseLeave={() => setHoveredColumn(null)}
                     style={{
                        cursor: 'grab',
                        padding: '8px',
                        border: '1px dashed #ccc',
                        margin: '4px',
                        backgroundColor: hoveredColumn === item ? '#DFE5F3' : 'transparent',
                        borderRadius: hoveredColumn === item ? '7px' : "0",
                        transition: 'background-color 0.3s'
                     }}
                  >
                     {item.replace(/_/g, ' ')}
                  </div>
               ))}
            </div>

            <div style={{ display: "flex", gap: 16, marginTop: '20px', marginRight: '3rem' }}>
               <div>
                  <input
                     type="number"
                     placeholder="Interpolation Value"
                     onChange={(e) => setInterpolationValue(Number(e.target.value))}
                  />
                  <button onClick={handleInterpolation}>Interpolate</button>
               </div>

               <img src='/download.png'
                  alt="Download"
                  width={24} height={24}
                  onClick={saveChartAsImage}
               />
            </div>
         </div>

         <div
            ref={chartRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{
               border: "2px dashed #aaa",
               padding: "20px",
               margin: "0 3rem",
               minHeight: "70vh",
               cursor: "pointer"
            }}
         />
      </div>
   );
};

export default ChartComponent;
