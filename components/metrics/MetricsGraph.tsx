import React from 'react';

interface MetricsGraphProps {
    data: { label: string; value: number }[];
    color?: string;
    type?: 'line' | 'bar';
    height?: number;
    maxValue?: number;
}

const MetricsGraph: React.FC<MetricsGraphProps> = ({
    data,
    color = '#6366f1',
    type = 'line',
    height = 300,
    maxValue
}) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                No data available for this period.
            </div>
        );
    }

    const WIDTH = 1000;
    const HEIGHT = height;
    const PAD = 40;

    // Calculate Max Y with some buffer
    const maxVal = Math.max(...data.map(p => p.value), 10);
    const maxY = maxValue || Math.ceil(maxVal * 1.1); // Use fixed max if provided, else 10% buffer

    const getX = (i: number) => PAD + (i / (data.length - 1 || 1)) * (WIDTH - PAD * 2);
    const getY = (v: number) => HEIGHT - PAD - (v / maxY) * (HEIGHT - PAD * 2);

    if (type === 'bar') {
        const barW = (WIDTH - PAD * 2) / data.length * 0.6;
        return (
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-full overflow-visible">
                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(p => {
                    const y = HEIGHT - PAD - (p * (HEIGHT - PAD * 2));
                    return (
                        <g key={p}>
                            <line x1={PAD} y1={y} x2={WIDTH - PAD} y2={y} stroke="white" strokeOpacity="0.05" />
                            <text x={PAD - 10} y={y + 4} textAnchor="end" fill="#64748b" fontSize="10">{Math.round(maxY * p)}</text>
                        </g>
                    );
                })}

                {data.map((point, i) => {
                    const h = (point.value / maxY) * (HEIGHT - PAD * 2);
                    const x = PAD + i * ((WIDTH - PAD * 2) / data.length) + ((WIDTH - PAD * 2) / data.length - barW) / 2;
                    const y = HEIGHT - PAD - h;
                    return (
                        <g key={i} className="group">
                            <rect x={x} y={y} width={barW} height={h} fill={color} rx="4" className="opacity-80 group-hover:opacity-100 transition-opacity" />
                            <text x={x + barW / 2} y={y - 5} textAnchor="middle" fill="white" fontSize="12" className="opacity-0 group-hover:opacity-100 transition-opacity">{point.value}</text>
                            <text x={x + barW / 2} y={HEIGHT - 15} textAnchor="middle" fill="#94a3b8" fontSize="10">{point.label}</text>
                        </g>
                    );
                })}
            </svg>
        );
    }

    // Line Chart
    const points = data.map((p, i) => `${getX(i)},${getY(p.value)}`).join(' ');
    const areaPoints = `${getX(0)},${HEIGHT - PAD} ${points} ${getX(data.length - 1)},${HEIGHT - PAD}`;

    return (
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-full overflow-visible">
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(p => {
                const y = HEIGHT - PAD - (p * (HEIGHT - PAD * 2));
                return (
                    <g key={p}>
                        <line x1={PAD} y1={y} x2={WIDTH - PAD} y2={y} stroke="white" strokeOpacity="0.05" />
                        <text x={PAD - 10} y={y + 4} textAnchor="end" fill="#64748b" fontSize="10">{Math.round(maxY * p)}</text>
                    </g>
                );
            })}

            {/* Area Fill */}
            <defs>
                <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={areaPoints} fill={`url(#gradient-${color.replace('#', '')})`} />

            {/* Line */}
            <polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {/* Dots */}
            {data.map((point, i) => (
                <g key={i} className="group">
                    <circle cx={getX(i)} cy={getY(point.value)} r="4" fill={color} stroke="#1e293b" strokeWidth="2" className="group-hover:r-6 transition-all" />

                    {/* Tooltip */}
                    <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <rect x={getX(i) - 20} y={getY(point.value) - 35} width="40" height="25" rx="4" fill="#1e293b" />
                        <text x={getX(i)} y={getY(point.value) - 18} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{point.value}</text>
                    </g>

                    {/* X Axis Label (Show every nth label to avoid crowding) */}
                    {(i % Math.ceil(data.length / 10) === 0 || i === data.length - 1) && (
                        <text x={getX(i)} y={HEIGHT - 15} textAnchor="middle" fill="#94a3b8" fontSize="10">{point.label}</text>
                    )}
                </g>
            ))}
        </svg>
    );
};

export default MetricsGraph;
