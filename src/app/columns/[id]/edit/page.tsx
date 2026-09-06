import ColumnForm from '@/components/columns/ColumnForm';

export const metadata = { title: '칼럼 수정 | Connectivity' };

export default function EditColumnPage({ params }: { params: { id: string } }) {
  return <ColumnForm mode="edit" id={params.id} />;
}
