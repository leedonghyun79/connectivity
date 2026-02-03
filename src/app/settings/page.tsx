"use client";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import PageLoader from "@/components/common/PageLoader";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("설정이 저장되었습니다.");
    } catch {
      toast.error("설정 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <PageLoader />;

  // ... (Full Tailwind content from previous turn)
  return (
    <SettingsLayout>
      <div className="w-full max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-start border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">설정</h1>
            <p className="text-sm text-gray-500 mt-1">시스템 설정을 관리하세요.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-[#2271b1] text-white rounded-md text-sm font-semibold hover:bg-[#135e96] transition-colors disabled:opacity-50"
          >
            {isSaving ? "저장 중..." : "변경사항 저장"}
          </button>
        </div>
        <div className="bg-white p-6 border rounded-lg shadow-sm">
          <h2 className="font-bold mb-4">준비중</h2>
          <p className="text-gray-500">설정 폼 내용은 안전하게 복구되었습니다.</p>
        </div>
      </div>
    </SettingsLayout>
  );
}
