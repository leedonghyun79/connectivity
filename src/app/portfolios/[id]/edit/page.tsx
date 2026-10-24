import PortfolioForm from '@/components/portfolio/PortfolioForm';

export const metadata = { title: '작업물 수정 | Connectivity' };

export default async function EditPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PortfolioForm mode="edit" id={id} />;
}
