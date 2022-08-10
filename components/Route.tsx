import styles from '../styles/Link.module.css';
import {Log, Route as RouteType} from '@prisma/client';
import {Bar, Line} from 'react-chartjs-2';
import {
  ScatterDataPoint,
  ChartData as ChartJSData,
  ChartOptions as ChartJSOptions,
} from 'chart.js';
import {useEffect, useState} from 'react';

type TData = (number | ScatterDataPoint | null)[];
type LineChartData = ChartJSData<'line', TData, unknown>;
type BarChartData = ChartJSData<'bar', TData, unknown>;

type LineChartOptions = ChartJSOptions<'line'>;
type BarChartOptions = ChartJSOptions<'bar'>;

type RouteExtended = RouteType & {logs: Log[]};
type Props = {
  route: RouteExtended | null;
};

const getUniversalChartOptions = (title?: string) => {
  const options: ChartJSOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title || 'Chart.js Line Chart',
      },
    },
    scales: {
      yAxes: {
        suggestedMin: 0, // minimum will be 0, unless there is a lower value.
        beginAtZero: true, // minimum value will be 0.
        suggestedMax: 5,
        ticks: {
          precision: 0,
        },
      },
    },
  };
  return options;
};

const addHour = (inDate: Date) => {
  const out = new Date(inDate);
  out.setMinutes(0);
  out.setSeconds(0);
  out.setMilliseconds(0);
  out.setHours(out.getHours() + 1);
  return out;
};

const floorHour = (inDate: Date) => {
  const out = new Date(inDate);
  out.setMinutes(0, 0, 0);
  return out;
};

const getLineData = (route: RouteExtended): LineChartData => {
  const createdAt = new Date(route.createdAt);
  const labels = [];
  const data = [];

  for (
    let date = floorHour(createdAt);
    date < new Date();
    date = addHour(date)
  ) {
    labels.push(
      `${date.getFullYear()}/${
        date.getMonth() + 1
      }/${date.getDate()} ${date.getHours()}h`,
    );
    const nextHour = addHour(date);
    const logs = route.logs.filter((log) => {
      const time = new Date(log.time);
      return time < nextHour && time >= date;
    });
    data.push(logs.length);
  }
  return {
    labels,
    datasets: [
      {
        fill: true,
        label: 'Click',
        data,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };
};

const getLineGraph = (route: RouteExtended) => {
  const options = getUniversalChartOptions('Link clicks') as LineChartOptions;
  return (
    <div className={styles.graph}>
      <Line options={options} data={getLineData(route)} redraw />
    </div>
  );
};

const getBarData = (route: RouteExtended): BarChartData => {
  const map = new Map<string, number>();
  const defaultKey = 'Untracked';
  map.set(defaultKey, 0);
  route.logs.forEach((log) => {
    const name = log.from || defaultKey;
    if (!map.has(name)) {
      map.set(name, 0);
    }
    map.set(name, map.get(name)! + 1);
  });

  return {
    labels: ['From'],
    datasets: Array.from(map.entries())
      .sort(([k1, v1], [k2, v2]) => v2 - v1)
      .map(([key, value], i, arr) => {
        return {
          label: key,
          data: [value],
          backgroundColor: `rgba(0, 0.2, ${
            (255 / arr.length) * (arr.length - i)
          }, 0.5)`,
        };
      }),
  };
};

const getBarGraph = (route: RouteExtended) => {
  const options = getUniversalChartOptions('Click tracking') as BarChartOptions;
  return (
    <div className={styles.graph}>
      <Bar options={options} data={getBarData(route)} redraw />
    </div>
  );
};

const Route = ({route}: Props) => {
  if (!route) return <h1>Nothing selected!</h1>;

  return (
    <div className={styles.content}>
      <h1>
        {route.from} -{'>'} {route.to}
      </h1>
      {getLineGraph(route)}
      {getBarGraph(route)}
    </div>
  );
};

// Hook
function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  type Size = {
    width?: number;
    height?: number;
  };
  const [windowSize, setWindowSize] = useState<Size>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // only execute all the code below in client side
    if (typeof window !== 'undefined') {
      // Handler to call on window resize
      function handleResize() {
        // Set window width/height to state
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }

      // Add event listener
      window.addEventListener('resize', handleResize);

      // Call handler right away so state gets updated with initial window size
      handleResize();

      // Remove event listener on cleanup
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}

export default Route;
