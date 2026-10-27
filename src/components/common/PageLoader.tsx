// 페이지 전체 로딩 — 페이지 모양에 맞춘 스켈레톤
// 제목(title)이 있으면 실제 글자로, 없으면 막대로 표시
type Variant = 'table' | 'sales' | 'settings' | 'generic' | 'estimates' | 'inquiries';

type ToolbarKind = 'search' | 'tabs' | 'dates' | 'nav';

interface PageLoaderProps {
  title?: string;
  variant?: Variant;
  toolbar?: ToolbarKind;
}

const box = 'bg-white rounded-[8px] border border-[#D1D5DB]';

const gridCols: Record<number, string> = {
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
};

// 요약 카드 — darkLast면 마지막 카드를 검은 카드로 표시
function SummaryCards({ count = 4, darkLast = false, md = 'md:grid-cols-2' }: { count?: number; darkLast?: boolean; md?: string }) {
  return (
    <div className={`grid grid-cols-1 ${md} gap-4 ${gridCols[count] ?? ''}`}>
      {Array.from({ length: count }).map((_, i) => {
        const dark = darkLast && i === count - 1;
        return (
          <div key={i} className={`h-32 ${dark ? 'bg-black border-black' : box} rounded-[8px] border p-6 flex flex-col justify-between`}>
            <div className="flex justify-between items-start">
              <div className={`h-3 w-24 rounded ${dark ? 'bg-gray-700' : 'bg-gray-100'}`} />
              <div className={`h-9 w-9 rounded-[8px] ${dark ? 'bg-white/10' : 'bg-gray-50'}`} />
            </div>
            <div className={`h-7 w-20 rounded ${dark ? 'bg-gray-700' : 'bg-gray-100'}`} />
          </div>
        );
      })}
    </div>
  );
}

function CardTitle() {
  return (
    <div className="space-y-2 mb-8">
      <div className="h-2.5 w-20 bg-gray-50 rounded" />
      <div className="h-6 w-40 bg-gray-100 rounded" />
    </div>
  );
}

function GridLines() {
  return (
    <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-px w-full bg-gray-100" />
      ))}
    </div>
  );
}

// 영역 차트 (추이 그래프)
function AreaChart({ height = 'h-[360px]' }: { height?: string }) {
  return (
    <div className={`${height} w-full relative pb-8`}>
      <GridLines />
      <svg className="absolute inset-x-0 top-0 w-full h-[calc(100%-32px)]" preserveAspectRatio="none" viewBox="0 0 100 100">
        <path d="M0,70 C15,40 25,85 40,55 S65,20 80,45 S95,30 100,35 L100,100 L0,100 Z" fill="#F3F4F6" />
        <path d="M0,70 C15,40 25,85 40,55 S65,20 80,45 S95,30 100,35" fill="none" stroke="#D1D5DB" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

// 막대 차트
function BarChart({ height = 'h-[320px]' }: { height?: string }) {
  const heights = [45, 70, 55, 85, 60, 75, 50];
  return (
    <div className={`${height} w-full flex items-end justify-around pb-8 relative`}>
      <GridLines />
      {heights.map((h, i) => (
        <div key={i} className="w-4 bg-gray-100 rounded-t-[8px]" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

// 도넛 차트
function DonutChart() {
  return (
    <div className="flex justify-center py-6">
      <div className="w-48 h-48 rounded-full border-[24px] border-gray-100" />
    </div>
  );
}

// 목록 행
function ListRows({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-6">
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 bg-gray-100 rounded" />
            <div className="h-2.5 w-1/5 bg-gray-50 rounded" />
          </div>
          <div className="h-6 w-16 bg-gray-100 rounded-[8px]" />
        </div>
      ))}
    </div>
  );
}

// 상단 도구 줄: 검색 + 필터 버튼, 또는 탭 + 검색
function Toolbar({ kind = 'search', tabs = 4 }: { kind?: ToolbarKind; tabs?: number }) {
  // 날짜 범위 (방문자 통계 - 유입 경로 / 검색어)
  if (kind === 'dates') {
    return (
      <div className="flex justify-end items-center gap-2 !mt-[30px]">
        <div className="h-9 w-32 bg-gray-50 rounded-[8px]" />
        <div className="h-3 w-3 bg-gray-100 rounded" />
        <div className="h-9 w-32 bg-gray-50 rounded-[8px]" />
      </div>
    );
  }
  // 날짜 이동 (일일 활동 내역)
  if (kind === 'nav') {
    return (
      <div className="flex justify-end !mt-[30px]">
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-[8px] border border-[#D1D5DB]">
          <div className="h-9 w-9 bg-gray-100 rounded-[8px]" />
          <div className="h-9 w-32 bg-gray-100 rounded-[8px]" />
          <div className="h-9 w-9 bg-gray-100 rounded-[8px]" />
        </div>
      </div>
    );
  }
  if (kind === 'tabs') {
    return (
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-2">
          {Array.from({ length: tabs }).map((_, i) => (
            <div key={i} className={`h-9 rounded-[8px] ${i === 0 ? 'w-20 bg-black' : 'w-20 bg-gray-50'}`} />
          ))}
        </div>
        <div className="h-10 w-72 bg-gray-50 rounded-[8px]" />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-6">
      <div className="h-14 w-[480px] max-w-full bg-white border border-[#D1D5DB] rounded-[8px]" />
      <div className="h-14 w-44 bg-white border border-[#D1D5DB] rounded-[8px]" />
    </div>
  );
}

// 도구 줄 + 표 (열 개수는 실제 표와 맞춤)
function TableBlock({ rows = 4, toolbar = 'search' }: { rows?: number; cols?: number; toolbar?: ToolbarKind }) {
  return (
    <div className="space-y-6">
      <Toolbar kind={toolbar} />
      {/* 칼럼 관리 표와 같은 스켈레톤 */}
      <div className="overflow-hidden rounded-[8px] border border-[#D1D5DB] bg-white shadow-sm">
        <div className="p-8 space-y-5 animate-pulse">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-6">
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 bg-gray-100 rounded" />
                <div className="h-2.5 w-1/5 bg-gray-50 rounded" />
              </div>
              <div className="h-6 w-16 bg-gray-100 rounded-[8px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PageLoader({ variant = 'table', toolbar = 'search' }: PageLoaderProps) {
  // 제목은 상단 헤더(Header)가 보여주므로 스켈레톤에서는 그리지 않음
  return (
    <div className="w-full pt-0 pb-10 space-y-4 animate-pulse">

      {variant === 'estimates' && (
        <>
          <SummaryCards count={4} darkLast md="md:grid-cols-4" />
          <TableBlock rows={6} cols={5} />
        </>
      )}

      {variant === 'inquiries' && (
        <>
          <SummaryCards count={3} darkLast md="md:grid-cols-3" />
          <TableBlock rows={6} cols={6} />
        </>
      )}

      {variant === 'sales' && (
        <>
          {/* 상단 버튼 */}
          <div className="flex justify-end">
            <div className="h-11 w-44 bg-gray-100 rounded-[8px]" />
          </div>
          {/* 지표 4칸 (한 박스) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 !mt-[30px]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`${box} p-8 space-y-6`}>
                <div className="h-4 w-24 bg-gray-100 rounded" />
                <div className="h-9 w-28 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
          {/* 매출 통계 차트 */}
          <div className={`${box} p-4`}>
            <CardTitle />
            <div className="h-8 w-40 bg-gray-100 rounded-[8px] mt-6 mb-4" />
            <div className="h-[220px] w-full flex items-end justify-around pb-8">
              {[45, 70, 55, 85, 60, 75, 50, 65, 40, 80, 55, 70].map((h, i) => (
                <div key={i} className="w-20 bg-gray-100 rounded-t-[8px]" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={`${box} p-10 lg:col-span-2`}>
              <CardTitle />
              <BarChart />
            </div>
            <div className={`${box} p-10`}>
              <CardTitle />
              <DonutChart />
            </div>
          </div>
          {/* 거래 표 */}
          <div className={`${box} p-8`}>
            <div className="grid grid-cols-4 gap-6 pb-4 border-b border-[#D1D5DB]">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-2.5 w-16 bg-gray-100 rounded" />
              ))}
            </div>
            {Array.from({ length: 5 }).map((_, r) => (
              <div key={r} className="grid grid-cols-4 gap-6 py-5 border-b border-gray-50 last:border-0">
                {Array.from({ length: 4 }).map((_, c) => (
                  <div key={c} className={`h-3 ${c === 0 ? 'w-3/4' : 'w-1/2'} bg-gray-100 rounded`} />
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {variant === 'settings' && (
        <div className="flex gap-8">
          <div className="w-56 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-11 bg-gray-50 rounded-[8px]" />
            ))}
          </div>
          <div className={`${box} p-10 flex-1 space-y-8`}>
            <CardTitle />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-2.5 w-24 bg-gray-100 rounded" />
                <div className="h-11 w-full bg-gray-50 rounded-[8px]" />
              </div>
            ))}
          </div>
        </div>
      )}

      {variant === 'table' && <TableBlock rows={6} toolbar={toolbar} />}

      {variant === 'generic' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className={`${box} p-10`}>
            <CardTitle />
            <ListRows count={5} />
          </div>
          <div className={`${box} p-10`}>
            <CardTitle />
            <ListRows count={5} />
          </div>
        </div>
      )}
    </div>
  );
}
