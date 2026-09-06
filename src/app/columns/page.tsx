'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Send, Undo2, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { getColumns, deleteColumn, publishColumn, unpublishColumn } from '@/lib/actions';
import ConfirmModal from '@/components/common/ConfirmModal';

type Column = {
  id: string;
  title: string;
  category: string;
  status: string;
  publishedAt: string | Date | null;
  updatedAt: string | Date;
};

function fmt(d: string | Date | null) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export default function ColumnsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setRows((await getColumns()) as Column[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const doPublish = async (id: string) => {
    setBusyId(id);
    const res = await publishColumn(id);
    setBusyId(null);
    if (res.success) { toast.success('발행했습니다.'); load(); }
    else toast.error(res.error || '발행 실패');
  };
  const doUnpublish = async (id: string) => {
    setBusyId(id);
    const res = await unpublishColumn(id);
    setBusyId(null);
    if (res.success) { toast.success('발행을 취소했습니다.'); load(); }
    else toast.error(res.error || '발행 취소 실패');
  };
  const doDelete = async () => {
    if (!deleteId) return;
    setBusyId(deleteId);
    const res = await deleteColumn(deleteId);
    setBusyId(null);
    setDeleteId(null);
    if (res.success) { toast.success('삭제했습니다.'); load(); }
    else toast.error(res.error || '삭제 실패');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-black">칼럼 관리</h1>
          <p className="mt-1 text-sm text-gray-400">픽셀커넥트 공개 사이트에 발행하는 칼럼</p>
        </div>
        <Link
          href="/columns/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus size={16} /> 새 칼럼
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="animate-spin text-gray-300" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-gray-400">
            <FileText size={28} className="opacity-40" />
            <p className="text-sm">아직 작성한 칼럼이 없습니다.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <th className="px-6 py-4">제목</th>
                <th className="px-4 py-4">카테고리</th>
                <th className="px-4 py-4">상태</th>
                <th className="px-4 py-4">발행일</th>
                <th className="px-4 py-4">수정일</th>
                <th className="px-6 py-4 text-right">액션</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const published = r.status === 'published';
                const rowBusy = busyId === r.id;
                return (
                  <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                    <td className="px-6 py-4">
                      <Link href={`/columns/${r.id}/edit`} className="font-semibold text-black hover:underline">
                        {r.title || '(제목 없음)'}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-gray-500">{r.category}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {published ? '발행됨' : '임시저장'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-500">{fmt(r.publishedAt)}</td>
                    <td className="px-4 py-4 text-gray-500">{fmt(r.updatedAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => router.push(`/columns/${r.id}/edit`)}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-black"
                          title="수정"
                        >
                          <Pencil size={15} />
                        </button>
                        {published ? (
                          <button
                            onClick={() => doUnpublish(r.id)} disabled={rowBusy}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-black disabled:opacity-40"
                            title="발행 취소"
                          >
                            {rowBusy ? <Loader2 size={15} className="animate-spin" /> : <Undo2 size={15} />}
                          </button>
                        ) : (
                          <button
                            onClick={() => doPublish(r.id)} disabled={rowBusy}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-green-600 disabled:opacity-40"
                            title="발행"
                          >
                            {rowBusy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteId(r.id)}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                          title="삭제"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={doDelete}
        title="칼럼 삭제"
        message="이 칼럼을 삭제하시겠습니까? 발행된 경우 공개 사이트에서도 제거됩니다."
        confirmText="삭제"
        type="danger"
      />
    </div>
  );
}
