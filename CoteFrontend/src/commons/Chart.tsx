import React from 'react';

interface ChartData {
  name?: string;
  month?: string;
  value: number;
}

interface ChartProps {
  type: 'line' | 'bar';
  data: ChartData[];
  color: 'blue' | 'green' | 'red' | 'purple' | 'yellow';
}

const colorClasses = {
  blue: 'fill-blue-500 stroke-blue-500',
  green: 'fill-green-500 stroke-green-500',
  red: 'fill-red-500 stroke-red-500',
  purple: 'fill-purple-500 stroke-purple-500',
  yellow: 'fill-yellow-500 stroke-yellow-500'
};

export const Chart: React.FC<ChartProps> = ({ type, data, color }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const width = 400;
  const height = 200;
  const padding = 40;

  if (type === 'line') {
    const points = data.map((d, i) => {
      const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
      const y = height - padding - ((d.value / maxValue) * (height - 2 * padding));
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
          <polyline
            points={points}
            className={`${colorClasses[color]} fill-none stroke-2`}
          />
          {data.map((d, i) => {
            const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
            const y = height - padding - ((d.value / maxValue) * (height - 2 * padding));
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                className={colorClasses[color]}
              />
            );
          })}
        </svg>
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          {data.map((d, i) => (
            <span key={i}>{d.month || d.name}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
        {data.map((d, i) => {
          const barWidth = (width - 2 * padding) / data.length - 10;
          const x = padding + i * ((width - 2 * padding) / data.length);
          const barHeight = (d.value / maxValue) * (height - 2 * padding);
          const y = height - padding - barHeight;
          
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              className={colorClasses[color]}
              rx="2"
            />
          );
        })}
      </svg>
      <div className="flex justify-between text-xs text-gray-600 mt-2">
        {data.map((d, i) => (
          <span key={i}>{d.name || d.month}</span>
        ))}
      </div>
    </div>
  );
};