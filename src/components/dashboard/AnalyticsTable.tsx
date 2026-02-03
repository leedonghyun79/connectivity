'use client';

export default function AnalyticsTable() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">상세 분석</h3>
      </div>
      <div className="p-6 text-center text-gray-500 text-sm">
        데이터를 불러오는 중입니다...
      </div>
    </div>
  );
}
