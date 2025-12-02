import { useEffect, useRef } from 'react';

interface GaugeChartProps {
  value: number;
  max?: number;
  size?: number;
  thickness?: number;
  label?: string;
  unit?: string;
  color?: string;
  showValue?: boolean;
}

export default function GaugeChart({
  value,
  max = 100,
  size = 80,
  thickness = 8,
  label,
  unit = '%',
  color,
  showValue = true,
}: GaugeChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置高DPI显示
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    // 清空画布
    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size - thickness) / 2 - 2;

    // 计算百分比和角度
    const percentage = (value / max) * 100;
    const startAngle = -Math.PI / 2; // 从顶部开始
    const endAngle = startAngle + (percentage / 100) * 2 * Math.PI;

    // 确定颜色
    let gaugeColor = color;
    if (!gaugeColor) {
      if (percentage < 60) {
        gaugeColor = '#10b981'; // green
      } else if (percentage < 80) {
        gaugeColor = '#f59e0b'; // orange
      } else {
        gaugeColor = '#ef4444'; // red
      }
    }

    // 绘制背景圆环
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 绘制进度圆环
    if (percentage > 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.strokeStyle = gaugeColor;
      ctx.lineWidth = thickness;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // 绘制中心文字
    if (showValue) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // 百分比
      ctx.fillStyle = '#0f172a';
      ctx.font = `bold ${size * 0.22}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillText(`${Math.round(percentage)}`, centerX, centerY - size * 0.08);
      
      // 单位
      ctx.fillStyle = '#64748b';
      ctx.font = `${size * 0.14}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillText(unit, centerX, centerY + size * 0.1);
    }
  }, [value, max, size, thickness, color, unit, showValue]);

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} />
      {label && <p className="text-xs text-slate-600 mt-1">{label}</p>}
    </div>
  );
}
