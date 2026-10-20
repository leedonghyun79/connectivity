import { render, screen, waitFor } from '@testing-library/react';
import EstimateModal from './EstimateModal';

jest.mock('@/lib/actions', () => ({
  createEstimate: jest.fn(),
  updateEstimate: jest.fn(),
  getCustomers: jest.fn().mockResolvedValue([]),
}));

jest.mock('./SignaturePad', () => () => null);

describe('EstimateModal supplier information', () => {
  it('renders the company and representative in separate rows', async () => {
    render(
      <EstimateModal
        isOpen
        onClose={jest.fn()}
        onSuccess={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('상호')).toBeInTheDocument();
    });

    const companyLabel = screen.getByText('상호');
    const representativeLabel = screen.getByText('대표');
    const companyInput = screen.getByDisplayValue('커넥티비티(Connectivity)');
    const representativeInput = screen.getByDisplayValue('홍길동');
    const supplierGrid = companyLabel.parentElement;

    expect(supplierGrid).not.toBeNull();
    expect(companyInput.parentElement).toBe(supplierGrid);
    expect(representativeLabel.parentElement).toBe(supplierGrid);
    expect(representativeInput.parentElement).toBe(supplierGrid);
    expect(companyLabel.nextElementSibling).toBe(companyInput);
    expect(representativeLabel.nextElementSibling).toBe(representativeInput);
  });
});
