"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import "echarts-gl";

type ChartData = {
  price?: number[][];
  grid?: number[][];
  NAS?: number;
  NVS?: number;
  K?: number;
  T?: number;
} | null;
type Props = { data: ChartData };

export default function MyChart({ data }: Props) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<echarts.EChartsType | null>(null);

  // Initialize chart once
  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current, undefined, {
      renderer: "canvas",
      useDirtyRect: true,
    });
    chartInstanceRef.current = chart;

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstanceRef.current = null;
      chart.dispose();
    };
  }, []);

  // Render when data changes
  useEffect(() => {
    const chart = chartInstanceRef.current;
    if (!chart || !data) return;

    // 3D surface: option value over (S, v) grid
    if (Array.isArray(data.grid) && Array.isArray(data.grid[0])) {
      const grid = data.grid as number[][];
      const NAS = data.NAS ?? grid.length;
      const NVS = data.NVS ?? (grid[0]?.length ?? 0);
      const K = data.K ?? 100;

      const Smax = 2 * K;
      const ds = NAS > 1 ? Smax / (NAS - 1) : 1;
      const dv = NVS > 1 ? 1 / (NVS - 1) : 1;

      const surfaceData: [number, number, number][] = [];
      let zMin = Number.POSITIVE_INFINITY;
      let zMax = Number.NEGATIVE_INFINITY;
      for (let i = 0; i < NAS; i++) {
        for (let j = 0; j < NVS; j++) {
          const z = grid[i]?.[j] ?? 0;
          const x = i * ds; // S axis
          const y = j * dv; // v axis
          surfaceData.push([x, y, z]);
          if (z < zMin) zMin = z;
          if (z > zMax) zMax = z;
        }
      }

      chart.setOption(
        {
          animation: false,
          tooltip: { show: false },
          visualMap: {
            type: "continuous",
            dimension: 2,
            min: zMin,
            max: zMax,
            calculable: true,
            inRange: {
              color: ["#1b6ff0", "#41c3ff", "#7be495", "#f8d648", "#f05454"],
            },
          },
          xAxis3D: { type: "value", name: "S", min: 0, max: Smax },
          yAxis3D: { type: "value", name: "v", min: 0, max: 1 },
          zAxis3D: { type: "value", name: "Option" },
          grid3D: {
            viewControl: { projection: "perspective", autoRotate: false },
            boxWidth: 120,
            boxDepth: 120,
            boxHeight: 60,
            axisLine: { lineStyle: { color: "#888" } },
            axisPointer: { show: false },
          },
          series: [
            {
              type: "surface",
              wireframe: { show: false },
              shading: "realistic",
              data: surfaceData,
            },
          ],
        },
        true
      );
      return;
    }

    // 2D paths (existing behaviour)
    const price = data?.price;
    if (!Array.isArray(price) || !Array.isArray(price[0])) return;

    const paths = price as number[][];
    const pointCount = paths[0]?.length ?? 0;
    const useGL = pointCount > 8000; // switch to WebGL for very large series

    // Down-sample but preserve original x-index to avoid straight-line artifacts
    const downsample = (arr: number[], maxPoints: number) => {
      if (arr.length <= maxPoints) return arr.map((y, i) => [i, y] as [number, number]);
      const step = arr.length / maxPoints;
      const out: [number, number][] = [];
      for (let i = 0; i < arr.length; i += step) {
        const idx = Math.floor(i);
        out.push([idx, arr[idx]]);
      }
      // ensure last point included
      if (out[out.length - 1]?.[0] !== arr.length - 1) {
        out.push([arr.length - 1, arr[arr.length - 1]]);
      }
      return out;
    };

    const series = useGL
      ? paths.map((path, i) => ({
          name: `path ${i + 1}`,
          type: "linesGL",
          coordinateSystem: "cartesian2d",
          polyline: true,
          data: [{ coords: path.map((y, x) => [x, y]) }],
          lineStyle: { width: 1, opacity: 0.75 },
          blendMode: "lighter",
          emphasis: { disabled: true },
        }))
      : paths.map((path, i) => ({
          name: `path ${i + 1}`,
          type: "line",
          data: downsample(path, 6000),
          showSymbol: false,
          sampling: "lttb",
          large: true,
          largeThreshold: 2000,
          progressive: 8000,
          hoverLayerThreshold: Infinity,
          animation: false,
          hoverAnimation: false,
          emphasis: { disabled: true },
        }));

    chart.setOption(
      {
        animation: false,
        title: { text: "Heston Paths" },
        tooltip: { show: false },
        dataZoom: [{ type: "slider", realtime: false, throttle: 50 }],
        grid: { containLabel: false },
        xAxis: { type: "value", min: 0, max: pointCount - 1 },
        yAxis: { type: "value", scale: true },
        series,
      },
      true
    );
  }, [data]);

  return <div ref={chartRef} className="w-full h-[500px]" />;
}
