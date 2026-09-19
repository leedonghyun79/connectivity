'use server';

import prisma from './prisma';
import { revalidatePath } from 'next/cache';

/**
 * 작업물(포트폴리오) 관련 액션.
 * connectivity가 유일한 DB(source of truth). pixelconnect 공개 사이트는
 * /api/public/portfolios 를 fetch 해서 표시만 한다 (push 없음).
 */
const PORTFOLIO_CATEGORIES = ['쇼핑몰', '기업 홈페이지', '병원·클리닉', '교육', '기타'];

export interface PortfolioInput {
  title: string;
  category: string;
  tags: string[];
  result?: string | null;
  client?: string | null;
  projectType?: string | null;
  websiteUrl?: string | null;
  thumbnail?: string | null;
  contentHtml: string;
  contentJson?: any;
}

export async function getPortfolios() {
  try {
    return await prisma.portfolio.findMany({ orderBy: { updatedAt: 'desc' } });
  } catch (error) {
    console.error('Failed to fetch portfolios:', error);
    return [];
  }
}

export async function getPortfolio(id: string) {
  try {
    return await prisma.portfolio.findUnique({ where: { id } });
  } catch (error) {
    console.error('Failed to fetch portfolio:', error);
    return null;
  }
}

export async function createPortfolio(data: PortfolioInput) {
  try {
    if (!data.title?.trim()) return { success: false, error: '제목을 입력하세요.' };
    if (!PORTFOLIO_CATEGORIES.includes(data.category)) return { success: false, error: '카테고리를 선택하세요.' };
    const item = await prisma.portfolio.create({
      data: {
        title: data.title.trim(),
        category: data.category,
        tags: data.tags ?? [],
        result: data.result || null,
        client: data.client || null,
        projectType: data.projectType || null,
        websiteUrl: data.websiteUrl || null,
        thumbnail: data.thumbnail || null,
        contentHtml: data.contentHtml ?? '',
        contentJson: data.contentJson ?? undefined,
        status: 'draft',
      },
    });
    revalidatePath('/portfolios');
    return { success: true, data: item };
  } catch (error) {
    console.error('Failed to create portfolio:', error);
    return { success: false, error: '작업물 생성에 실패했습니다.' };
  }
}

export async function updatePortfolio(id: string, data: PortfolioInput) {
  try {
    if (!data.title?.trim()) return { success: false, error: '제목을 입력하세요.' };
    if (!PORTFOLIO_CATEGORIES.includes(data.category)) return { success: false, error: '카테고리를 선택하세요.' };
    const item = await prisma.portfolio.update({
      where: { id },
      data: {
        title: data.title.trim(),
        category: data.category,
        tags: data.tags ?? [],
        result: data.result || null,
        client: data.client || null,
        projectType: data.projectType || null,
        websiteUrl: data.websiteUrl || null,
        thumbnail: data.thumbnail || null,
        contentHtml: data.contentHtml ?? '',
        contentJson: data.contentJson ?? undefined,
      },
    });
    revalidatePath('/portfolios');
    return { success: true, data: item };
  } catch (error) {
    console.error('Failed to update portfolio:', error);
    return { success: false, error: '작업물 수정에 실패했습니다.' };
  }
}

export async function publishPortfolio(id: string) {
  try {
    const existing = await prisma.portfolio.findUnique({ where: { id } });
    if (!existing) return { success: false, error: '작업물을 찾을 수 없습니다.' };
    const item = await prisma.portfolio.update({
      where: { id },
      data: { status: 'published', publishedAt: existing.publishedAt ?? new Date() },
    });
    revalidatePath('/portfolios');
    return { success: true, data: item };
  } catch (error: any) {
    console.error('Failed to publish portfolio:', error);
    return { success: false, error: error.message || '발행에 실패했습니다.' };
  }
}

export async function unpublishPortfolio(id: string) {
  try {
    const item = await prisma.portfolio.update({
      where: { id },
      data: { status: 'draft' },
    });
    revalidatePath('/portfolios');
    return { success: true, data: item };
  } catch (error: any) {
    console.error('Failed to unpublish portfolio:', error);
    return { success: false, error: error.message || '발행 취소에 실패했습니다.' };
  }
}

export async function deletePortfolio(id: string) {
  try {
    await prisma.portfolio.delete({ where: { id } });
    revalidatePath('/portfolios');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete portfolio:', error);
    return { success: false, error: '작업물 삭제에 실패했습니다.' };
  }
}
