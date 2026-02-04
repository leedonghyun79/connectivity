'use client';

import { FileText, ArrowRight, Eye, Briefcase } from 'lucide-react';

export default function RecentWorkList() {
  const activities = [
    { id: 1, type: 'ESTIMATE', title: '견적서 EST-2024-001 발행', client: '글로벌 테크', time: '2시간 전' },
    { id: 2, type: 'INQUIRY', title: '기술 지원 문의 답변 완료', client: '박민준 님', time: '4시간 전' },
    { id: 3, type: 'CLIENT', title: '신규 고객사 등록 완료', client: '픽셀 웍스', time: '1일 전' },
    { id: 4, type: 'REVENUE', title: '거래 대금 입금 확인', client: '넥서스 소프트', time: '1일 전' },
  ];

  return (
    <div className="bg-white p-10 rounded-[32px] border border-gray-100 h-full flex flex-col group">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">운영 감사 로그</div>
          <h3 className="text-2xl font-black text-black uppercase tracking-tighter">최근 활동 피드</h3>
        </div>
        <div className="p-3 bg-gray-50 rounded-2xl text-gray-300 group-hover:text-black transition-all">
          <Eye size={20} />
        </div>
      </div>

      <div className="space-y-6 flex-1">
        {activities.map((item) => (
          <div key={item.id} className="flex gap-4 relative pl-8 before:absolute before:left-3 before:top-2 before:bottom-[-24px] before:w-px before:bg-gray-100 last:before:hidden">
            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center z-10
                ${item.type === 'ESTIMATE' ? 'bg-black' : 'bg-gray-200'}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>

            <div className="flex-1 pb-6 border-b border-gray-50 flex justify-between items-end">
              <div>
                <div className="text-[11px] font-black text-black uppercase tracking-tight mb-0.5">{item.title}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.client}</div>
              </div>
              <div className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">{item.time}</div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-10 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border border-gray-100 rounded-2xl hover:bg-black hover:text-white hover:border-black transition-all flex items-center justify-center gap-2">
        상세 활동 내역 보기 <ArrowRight size={14} />
      </button>
    </div>
  );
}
