import ColumnForm from '@/components/columns/ColumnForm';

export const metadata = { title: '새 칼럼 작성 | Connectivity' };

export default function NewColumnPage() {
  return <ColumnForm mode="create" />;
}
