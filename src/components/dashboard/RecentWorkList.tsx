'use client';

export default function RecentWorkList() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">최근 작업 내역</h3>
      <div className="space-y-4">
        <div className="text-sm text-gray-500 text-center py-4">최근 작업 내역이 없습니다.</div>
      </div>
    </div>
  );
}
