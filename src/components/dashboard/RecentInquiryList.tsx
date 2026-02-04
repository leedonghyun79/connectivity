'use client';

export default function RecentInquiryList() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">최근 문의</h3>
      <div className="space-y-4">
        <div className="text-sm text-gray-500 text-center py-4">최근 접수된 문의가 없습니다.</div>
      </div>
    </div>
  );
}
