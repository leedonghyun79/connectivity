'use client';

export default function TrafficSource() {
  const data = [
    { label: 'Google 검색', value: 45, color: '#4285F4', bg: 'bg-blue-500' },
    { label: 'Naver 검색', value: 25, color: '#03C75A', bg: 'bg-green-500' },
    { label: 'Instagram', value: 15, color: '#E1306C', bg: 'bg-pink-500' },
    { label: '직접 접속', value: 10, color: '#808080', bg: 'bg-gray-500' },
    { label: '기타', value: 5, color: '#F4B400', bg: 'bg-yellow-500' },
  ];

  // 도넛 차트를 위한 CSS conic-gradient 생성
  // 예: conic-gradient(#4285F4 0% 45%, #03C75A 45% 70%, ...)
  let currentPercent = 0;
  const gradientParts = data.map(item => {
    const start = currentPercent;
    currentPercent += item.value;
    return `${item.color} ${start}% ${currentPercent}%`;
  });
  const gradientString = `conic-gradient(${gradientParts.join(', ')})`;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] h-full">
      <h3 className="text-lg font-bold text-gray-900 mb-6">유입 경로 분석</h3>

      <div className="flex flex-col items-center gap-6">
        {/* 도넛 차트 - 크기 조정 및 중앙 정렬 */}
        <div className="relative w-40 h-40 rounded-full flex-shrink-0" style={{ background: gradientString }}>
          <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center flex-col">
            <span className="text-xs text-gray-500 font-medium">Total Visits</span>
            <span className="text-xl font-bold text-gray-900">3,450</span>
          </div>
        </div>

        {/* 범례 및 수치 */}
        <div className="w-full space-y-3">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between group">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.bg}`}></span>
                <span className="text-sm text-gray-600 truncate font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* 게이지 바 */}
                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.bg}`} style={{ width: `${item.value}%` }}></div>
                </div>
                <span className="text-sm font-bold text-gray-900 w-8 text-right tabular-nums">{item.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
