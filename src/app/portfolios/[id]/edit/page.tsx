import PortfolioForm from '@/components/portfolio/PortfolioForm';

export const metadata = { title: '작업물 수정 | Connectivity' };

export default function EditPortfolioPage({ params }: { params: { id: string } }) {
  return <PortfolioForm mode="edit" id={params.id} />;
}
