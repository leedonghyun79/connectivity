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
import { ArrowUpRight } from 'lucide-react';

export default function VisitorChart() {
  const data = [
    { date: '01-29', pv: 7, visitor: 3 },
    { date: '01-30', pv: 8, visitor: 5 },
    { date: '01-31', pv: 5, visitor: 3 },
    { date: '02-01', pv: 3, visitor: 3 },
    { date: '02-02', pv: 2, visitor: 2 },
    { date: '02-03', pv: 4, visitor: 3 },
    { date: '02-04', pv: 6, visitor: 4 },
  ];

  return (
    <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-[0_40px_100px_rgba(0,0,0,0.02)] h-[480px] flex flex-col group">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Traffic Analysis</div>
          <h3 className="text-2xl font-black text-black uppercase tracking-tighter">Visitor Trends</h3>
        </div>
        <button className="p-3 bg-gray-50 rounded-2xl text-gray-300 group-hover:text-black group-hover:bg-black group-hover:text-white transition-all">
          <ArrowUpRight size={20} />
        </button>
      </div>

      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#000" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#000" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorVisitor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#000" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#000" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
              tickMargin={15}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
              tickCount={5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#000',
                borderRadius: '16px',
                border: 'none',
                color: '#fff',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                padding: '12px'
              }}
              itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#fff' }}
              labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px', fontWeight: 700 }}
            />
            <Legend
              iconType="rect"
              wrapperStyle={{ fontSize: '10px', fontWeight: 900, paddingTop: '20px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
              align="right"
              verticalAlign="top"
              height={36}
            />
            <Area
              type="monotone"
              dataKey="pv"
              name="Page Views"
              stroke="#e2e8f0"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorPv)"
              activeDot={{ r: 6, strokeWidth: 0, fill: '#000' }}
            />
            <Area
              type="monotone"
              dataKey="visitor"
              name="Unique Visitors"
              stroke="#000"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorVisitor)"
              activeDot={{ r: 8, strokeWidth: 4, stroke: '#fff', fill: '#000' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
