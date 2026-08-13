import { Chart } from "chart.js/auto";
import { useEffect, useRef } from "react";
import "./ChartCanvas.css";

const ChartCanvas = ({ config, height = 240, ariaLabel }) => {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return undefined;
        chartRef.current = new Chart(canvasRef.current, config);
        return () => chartRef.current?.destroy();
    }, [config]);

    return (
        <div className="chart-canvas" style={{ height }} role="img" aria-label={ariaLabel}>
            <canvas ref={canvasRef} aria-hidden="true" />
        </div>
    );
};

export default ChartCanvas;
