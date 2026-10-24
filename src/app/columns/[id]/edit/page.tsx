import ColumnForm from '@/components/columns/ColumnForm';

export const metadata = { title: '칼럼 수정 | Connectivity' };

export default async function EditColumnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ColumnForm mode="edit" id={id} />;
}
