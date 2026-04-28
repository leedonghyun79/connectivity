'use client';

import { useState, useEffect } from 'react';
import { getRecentInquiries } from '@/lib/actions';
import { MessageSquare, AlertCircle, CheckCircle2, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function RecentInquiryList() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getRecentInquiries().then(data => {
      setInquiries(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="bg-white p-10 rounded-[40px] border border-gray-100 flex flex-col gap-6 group">
      {/* 헤더 */}
      <div className="flex justify-between items-start">
        <div>
          <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">
            지원 인박스
          </div>
          <h3 className="text-2xl font-black text-black tracking-tighter uppercase">
            최근 문의
          </h3>
        </div>
        <Link
          href="/inquiries"
          className="p-3 bg-gray-50 rounded-2xl text-gray-200 group-hover:bg-black group-hover:text-white transition-all duration-300"
        >
          <ArrowUpRight size={20} />
        </Link>
      </div>

      {/* 목록 */}
      <div className="space-y-3 flex-1">
        {isLoading ? (
          // 스켈레톤
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl animate-pulse">
              <div className="w-8 h-8 bg-gray-100 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-2.5 bg-gray-50 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : inquiries.length === 0 ? (
          // 빈 상태
          <div className="flex flex-col items-center justify-center py-8 gap-3 opacity-20">
            <MessageSquare size={32} />
            <p className="text-xs font-black uppercase tracking-[0.2em]">
              접수된 문의 없음
            </p>
          </div>
        ) : (
          inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-all group cursor-pointer"
            >
              {/* 상태 아이콘 */}
              <div className={`p-2 rounded-xl flex-shrink-0 ${
                inquiry.status === 'pending'
                  ? 'bg-orange-50 text-orange-500'
                  : 'bg-gray-50 text-gray-400'
              }`}>
                {inquiry.status === 'pending'
                  ? <AlertCircle size={14} />
                  : <CheckCircle2 size={14} />}
              </div>

              {/* 내용 */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-black text-gray-900 truncate group-hover:translate-x-0.5 transition-transform">
                  {inquiry.title}
                </div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                  {inquiry.authorName || inquiry.customer?.name || '익명'} · {new Date(inquiry.createdAt).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}
                </div>
              </div>

              {/* 상태 뱃지 */}
              <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex-shrink-0 ${
                inquiry.status === 'pending'
                  ? 'bg-orange-50 text-orange-500 border border-orange-100'
                  : 'bg-black text-white'
              }`}>
                {inquiry.status === 'pending' ? '대기' : '완료'}
              </span>
            </div>
          ))
        )}
      </div>

      {/* 푸터 */}
      {!isLoading && inquiries.length > 0 && (
        <Link
          href="/inquiries"
          className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors flex items-center gap-1.5 self-end"
        >
          전체 보기 <ArrowUpRight size={11} />
        </Link>
      )}
    </div>
  );
}
