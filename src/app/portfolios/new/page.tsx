import PortfolioForm from '@/components/portfolio/PortfolioForm';

export const metadata = { title: '새 작업물 등록 | Connectivity' };

export default function NewPortfolioPage() {
  return <PortfolioForm mode="create" />;
}
