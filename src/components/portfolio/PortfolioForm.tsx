'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, ImagePlus, Loader2, Send, Save, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import type { JSONContent } from '@tiptap/core';
import {
  getPortfolio, createPortfolio, updatePortfolio,
  publishPortfolio, unpublishPortfolio,
} from '@/lib/portfolio-actions';
import { uploadImage } from '../editor/uploadImage';

const PORTFOLIO_CATEGORIES = ['쇼핑몰', '기업 홈페이지', '병원·클리닉', '교육', '기타'];

const PortfolioEditor = dynamic(() => import('../editor/ColumnEditor'), {
  ssr: false,
  loading: () => (
    <div className="mt-2 flex h-[460px] items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-400">
      에디터를 불러오는 중입니다...
    </div>
  ),
});

interface Props {
  mode: 'create' | 'edit';
  id?: string;
}

export default function PortfolioForm({ mode, id }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [result, setResult] = useState('');
  const [client, setClient] = useState('');
  const [projectType, setProjectType] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [html, setHtml] = useState('');
  const jsonRef = useRef<JSONContent>({});
  const [autoThumb, setAutoThumb] = useState('');
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const [thumbUploading, setThumbUploading] = useState(false);

  useEffect(() => {
    if (mode !== 'edit' || !id) return;
    getPortfolio(id).then((item) => {
      if (!item) {
        toast.error('작업물을 찾을 수 없습니다.');
        router.replace('/portfolios');
        return;
      }
      setTitle(item.title);
      setCategory(item.category);
      setTagsText((item.tags ?? []).join(', '));
      setResult(item.result ?? '');
      setClient(item.client ?? '');
      setProjectType(item.projectType ?? '');
      setWebsiteUrl(item.websiteUrl ?? '');
      setThumbnail(item.thumbnail ?? '');
      setHtml(item.contentHtml);
      jsonRef.current = (item.contentJson as JSONContent) ?? {};
      setStatus(item.status as 'draft' | 'published');
      setLoading(false);
    });
  }, [mode, id, router]);

  const handleEditorChange = (nextHtml: string, nextJson: JSONContent) => {
    setHtml(nextHtml);
    if (nextJson && Object.keys(nextJson).length) jsonRef.current = nextJson;
    const m = nextHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
    setAutoThumb(m ? m[1] : '');
  };

  const handleThumbFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setThumbUploading(true);
    try {
      setThumbnail(await uploadImage(file));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '업로드 실패');
    } finally {
      setThumbUploading(false);
    }
  };

  const payload = () => ({
    title,
    category,
    tags: tagsText.split(',').map((t) => t.trim()).filter(Boolean),
    result: result || null,
    client: client || null,
    projectType: projectType || null,
    websiteUrl: websiteUrl || null,
    contentHtml: html,
    contentJson: JSON.parse(JSON.stringify(jsonRef.current)),
    thumbnail: thumbnail || null,
  });

  const validate = () => {
    if (!title.trim()) return '제목을 입력하세요.';
    if (!PORTFOLIO_CATEGORIES.includes(category)) return '카테고리를 선택하세요.';
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) return toast.error(err);
    setSaving(true);
    try {
      if (mode === 'create') {
        const res = await createPortfolio(payload());
        if (!res.success || !res.data) throw new Error(res.error);
        toast.success('임시저장했습니다.');
        router.push(`/portfolios/${res.data.id}/edit`);
      } else {
        const res = await updatePortfolio(id!, payload());
        if (!res.success) throw new Error(res.error);
        toast.success('저장했습니다.');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    const err = validate();
    if (err) return toast.error(err);
    setSaving(true);
    try {
      let itemId = id;
      if (mode === 'create') {
        const res = await createPortfolio(payload());
        if (!res.success || !res.data) throw new Error(res.error);
        itemId = res.data.id;
      } else {
        const res = await updatePortfolio(id!, payload());
        if (!res.success) throw new Error(res.error);
      }
      const pub = await publishPortfolio(itemId!);
      if (!pub.success) throw new Error(pub.error);
      toast.success('발행했습니다.');
      router.push('/portfolios');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '발행에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleUnpublish = async () => {
    setSaving(true);
    try {
      const res = await unpublishPortfolio(id!);
      if (!res.success) throw new Error(res.error);
      setStatus('draft');
      toast.success('발행을 취소했습니다.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '발행 취소에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const effectiveThumb = thumbnail || autoThumb;
  const usingAuto = !thumbnail && !!autoThumb;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/portfolios" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-black">
          <ArrowLeft size={16} /> 작업물 목록
        </Link>
        <div className="flex items-center gap-2">
          {mode === 'edit' && status === 'published' && (
            <button onClick={handleUnpublish} disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-600 disabled:opacity-50">
              <Undo2 size={15} /> 발행 취소
            </button>
          )}
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 disabled:opacity-50">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {mode === 'create' ? '임시저장' : '저장'}
          </button>
          <button onClick={handlePublish} disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {status === 'published' ? '저장 후 재발행' : '발행'}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <h1 className="text-xl font-black tracking-tight text-black">
            {mode === 'create' ? '새 작업물 등록' : '작업물 수정'}
          </h1>
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
            status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {status === 'published' ? '발행됨' : '임시저장'}
          </span>
        </div>
        <p className="mb-8 text-sm text-gray-400">픽셀커넥트 공개 사이트 포트폴리오에 발행됩니다.</p>

        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">제목</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="프로젝트명 예: 비자르테 쇼핑몰"
              className="rounded-xl border border-gray-200 px-4 py-3 text-[15px] outline-none focus:border-black"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">카테고리</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-3 text-[15px] outline-none focus:border-black"
            >
              <option value="">카테고리를 선택하세요</option>
              {PORTFOLIO_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-800">고객사 (Client)</label>
              <input
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="예: (주)비자르테"
                className="rounded-xl border border-gray-200 px-4 py-3 text-[15px] outline-none focus:border-black"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-800">작업 유형 (Type)</label>
              <input
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                placeholder="예: 신규 제작, 리뉴얼"
                className="rounded-xl border border-gray-200 px-4 py-3 text-[15px] outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">태그 (쉼표로 구분)</label>
            <input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="예: 인테리어, 쇼핑몰"
              className="rounded-xl border border-gray-200 px-4 py-3 text-[15px] outline-none focus:border-black"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">한줄 성과</label>
            <input
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="예: 제작 후 문의 3배 증가"
              className="rounded-xl border border-gray-200 px-4 py-3 text-[15px] outline-none focus:border-black"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">웹사이트 URL</label>
            <input
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com"
              className="rounded-xl border border-gray-200 px-4 py-3 text-[15px] outline-none focus:border-black"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">대표 이미지</label>
            <div className="relative h-48 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              {effectiveThumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={effectiveThumb} alt="대표 이미지" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-gray-400">
                  <ImagePlus size={28} className="opacity-50" />
                  <p className="text-xs leading-relaxed">
                    대표 이미지를 추가하세요<br />추가하지 않으면 본문 첫 번째 이미지가 사용됩니다
                  </p>
                </div>
              )}
              {usingAuto && (
                <span className="absolute left-2.5 top-2.5 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white">
                  본문 첫 이미지
                </span>
              )}
            </div>
            <input ref={thumbInputRef} type="file" accept="image/*" hidden onChange={handleThumbFile} />
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => thumbInputRef.current?.click()}
                disabled={thumbUploading}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-[13px] font-semibold text-gray-700 disabled:opacity-50"
              >
                {thumbUploading ? '업로드 중...' : thumbnail ? '대표 이미지 변경' : '대표 이미지 추가'}
              </button>
              {thumbnail && (
                <button type="button" onClick={() => setThumbnail('')} className="text-[13px] font-semibold text-gray-400 hover:text-red-500">
                  제거
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">상세 설명</label>
            <PortfolioEditor value={html} onChange={handleEditorChange} placeholder="작업물에 대한 상세 설명을 작성해주세요..." />
          </div>
        </div>
      </div>
    </div>
  );
}
