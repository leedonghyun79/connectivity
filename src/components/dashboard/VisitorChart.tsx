'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function VisitorChart() {
  const data = [
    { date: '01-29', pv: 7, visitor: 3 },
    { date: '01-30', pv: 8, visitor: 5 },
    { date: '01-31', pv: 5, visitor: 3 },
    { date: '02-01', pv: 3, visitor: 3 },
    { date: '02-02', pv: 2, visitor: 2 },
    { date: '02-03', pv: 4, visitor: 3 }, // 데이터 살짝 수정 (0은 너무 없어서)
    { date: '02-04', pv: 6, visitor: 4 },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-gray-900">방문자</h3>
        <button className="text-xs text-gray-400 hover:text-gray-600">더보기</button>
      </div>

      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#bae6fd" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#bae6fd" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorVisitor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickMargin={10}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickCount={5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              itemStyle={{ fontSize: '12px' }}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              align="right"
              verticalAlign="top"
              height={36}
            />
            {/* 페이지뷰 (연한 하늘색) */}
            <Area
              type="monotone"
              dataKey="pv"
              name="페이지뷰"
              stroke="#7dd3fc"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPv)"
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            {/* 방문자 (진한 파란색) */}
            <Area
              type="monotone"
              dataKey="visitor"
              name="방문자"
              stroke="#2563eb"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorVisitor)"
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
