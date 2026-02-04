'use client';

import { BarChart3, PieChart } from 'lucide-react';

export default function TrafficSource() {
  const data = [
    { label: '구글 검색', value: 45, color: '#000000', bg: 'bg-black' },
    { label: '네이버 검색', value: 25, color: '#444444', bg: 'bg-gray-700' },
    { label: '소셜 미디어', value: 15, color: '#888888', bg: 'bg-gray-400' },
    { label: '직접 유입', value: 10, color: '#CCCCCC', bg: 'bg-gray-300' },
    { label: '참조 링크', value: 5, color: '#EEEEEE', bg: 'bg-gray-100' },
  ];

  let currentPercent = 0;
  const gradientParts = data.map(item => {
    const start = currentPercent;
    currentPercent += item.value;
    return `${item.color} ${start}% ${currentPercent}%`;
  });
  const gradientString = `conic-gradient(${gradientParts.join(', ')})`;

  return (
    <div className="bg-white p-10 rounded-[40px] border border-gray-100 h-full flex flex-col group">
      <div className="flex justify-between items-start mb-10">
        <div>
          <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">유입 로그</div>
          <h3 className="text-2xl font-black text-black uppercase tracking-tighter">유입 경로 분석</h3>
        </div>
        <div className="p-3 bg-gray-50 rounded-2xl text-gray-300 group-hover:text-black transition-all">
          <PieChart size={20} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-10">
        <div className="relative w-48 h-48 rounded-full flex-shrink-0" style={{ background: gradientString }}>
          <div className="absolute inset-5 bg-white rounded-full flex items-center justify-center flex-col border border-gray-50">
            <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest mb-1">전체 방문</span>
            <span className="text-3xl font-black text-black tracking-tighter">3.4K</span>
            <div className="w-8 h-1 bg-black rounded-full mt-2"></div>
          </div>
        </div>

        <div className="w-full space-y-5 px-2">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between group/item">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.bg}`}></span>
                <span className="text-[11px] text-gray-400 group-hover/item:text-black font-black uppercase tracking-wider transition-colors">{item.label}</span>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="w-20 h-1 bg-gray-50 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${item.bg}`} style={{ width: `${item.value}%` }}></div>
                </div>
                <span className="text-sm font-black text-black w-8 text-right tabular-nums tracking-tighter">{item.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
