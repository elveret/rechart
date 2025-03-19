import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const lineType = 'monotone',
  colorPV = '#8884d8',
  colorUV = '#82ca9d',
  colorRed = 'red';

const dataFour = [
  { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
];

// Функция для расчета среднего значения
const calculateMean = (values) => {
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
};

// Функция для расчета стандартного отклонения
const calculateStandardDeviation = (values, mean) => {
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
  const variance =
    squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length;
  return Math.sqrt(variance);
};

// Среднее значение для z-score = 1
let averegesForPercentage = {};

// Функция для расчета z-оценок
const calculateZScores = (data, fields) => {
  let preparingData = structuredClone(data);
  fields.forEach((fieldItem) => {
    // Извлекаем значения выбранного поля
    const values = preparingData.map((item) => item[fieldItem]);

    // Рассчитываем среднее значение и стандартное отклонение
    const mean = calculateMean(values);
    const stdDev = calculateStandardDeviation(values, mean);
    averegesForPercentage[fieldItem] = {
      mean,
      stdDev,
      averege: mean + stdDev,
    };

    // Добавляем z-оценки в данные
    preparingData = preparingData.map((item) => ({
      ...item,
      [`zScore${fieldItem}`]: (item[fieldItem] - mean) / stdDev,
    }));
  });

  return preparingData;
};

// Вычисляем z-оценки для полей uv и pv
const dataWithZScores = calculateZScores(dataFour, ['uv', 'pv']);

// Находим точку перехода для графиков
const percentagePV =
  100 -
  ((7 - (averegesForPercentage.pv.averege * 7) / 10000 - 1) / (7 - 1)) * 100;
const percentageUV =
  100 -
  ((7 - (averegesForPercentage.uv.averege * 7) / 10000 - 1) / (7 - 1)) * 100;

const customizedDot = ({ props, averageValue, color }) => {
  const { cx, cy, stroke, payload, value } = props;
  if (value >= averageValue) {
    return (
      <svg x={cx - 10} y={cy - 10} width={20} height={20} fill="red">
        <circle cx="10" cy="10" r="4" />
      </svg>
    );
  }

  return (
    <svg x={cx - 10} y={cy - 10} width={20} height={20} fill={color}>
      <circle cx="10" cy="10" r="4" />
    </svg>
  );
};

const CustomizedDotPV = (props) => {
  return customizedDot({
    props,
    averageValue: averegesForPercentage.pv.averege,
    color: colorPV,
  });
};

const CustomizedDotUV = (props) => {
  return customizedDot({
    props,
    averageValue: averegesForPercentage.uv.averege,
    color: colorUV,
  });
};

export default function App() {
  return (
    <ResponsiveContainer width={'100%'} height={300}>
      <LineChart data={dataWithZScores} margin={{ top: 20 }} accessibilityLayer>
        <defs>
          <linearGradient id="gradientPV" x1="0" y1="0" x2="0" y2="100%">
            <stop offset="0%" stopColor={colorRed} />
            <stop offset={`${percentagePV}%`} stopColor={colorRed} />
            <stop offset={`${percentagePV}%`} stopColor={colorPV} />
            <stop offset="100%" stopColor={colorPV} />
          </linearGradient>
          <linearGradient id="gradientUV" x1="0" y1="0" x2="0" y2="100%">
            <stop offset="0%" stopColor={colorRed} />
            <stop offset={`${percentageUV}%`} stopColor={colorRed} />
            <stop offset={`${percentageUV}%`} stopColor={colorUV} />
            <stop offset="100%" stopColor={colorUV} />
          </linearGradient>
        </defs>
        <Line
          type={lineType}
          dataKey="pv"
          stroke="url(#gradientPV)"
          dot={<CustomizedDotPV />}
        />
        <Line
          type={lineType}
          dataKey="uv"
          stroke="url(#gradientUV)"
          dot={<CustomizedDotUV />}
        />
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" padding={{ left: 30, right: 30 }} />
        <YAxis />
      </LineChart>
    </ResponsiveContainer>
  );
}
