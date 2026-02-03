'use client';

import { FileText, ArrowRight, Eye, Briefcase } from 'lucide-react';

export default function RecentWorkList() {
  const activities = [
    { id: 1, type: 'ESTIMATE', title: 'EST-2024-001 Issued', client: 'Global Tech Inc.', time: '2h ago' },
    { id: 2, type: 'INQUIRY', title: 'Service Support Answered', client: 'M. Park', time: '4h ago' },
    { id: 3, type: 'CLIENT', title: 'New Entity Registered', client: 'Pixel Works', time: '1d ago' },
    { id: 4, type: 'REVENUE', title: 'Transaction Confirmed', client: 'Nexus Soft', time: '1d ago' },
  ];

  return (
    <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] h-full flex flex-col group">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Operational Audit</div>
          <h3 className="text-2xl font-black text-black uppercase tracking-tighter">Activity Feed</h3>
        </div>
        <div className="p-3 bg-gray-50 rounded-2xl text-gray-300 group-hover:text-black transition-all">
          <Eye size={20} />
        </div>
      </div>

      <div className="space-y-6 flex-1">
        {activities.map((item) => (
          <div key={item.id} className="flex gap-4 relative pl-8 before:absolute before:left-3 before:top-2 before:bottom-[-24px] before:w-px before:bg-gray-100 last:before:hidden">
            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center z-10
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
        See All Activities <ArrowRight size={14} />
      </button>
    </div>
  );
}
