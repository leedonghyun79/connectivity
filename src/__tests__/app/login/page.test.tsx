import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/login/page';
import { signIn } from 'next-auth/react';

// next-auth 매니저(signIn) 모킹
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('LoginPage Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('기본 로그인 화면 렌더링 검증', () => {
    render(<LoginPage />);
    
    // UI 요소 존재 여부 테스트
    expect(screen.getByText('ADMIN LOGIN')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('아이디 입력')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('비밀번호 입력')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /로그인 및 인증 시작/i })).toBeInTheDocument();
  });

  it('Zod 유효성 검증: 빈 값 입력 시 방어', async () => {
    render(<LoginPage />);
    
    const submitButton = screen.getByRole('button', { name: /로그인 및 인증 시작/i });
    
    // 빈 상태로 전송 시도
    fireEvent.click(submitButton);

    // 유효성 에러 문구가 보이는지 체크
    await waitFor(() => {
      expect(screen.getByText('아이디를 입력해주세요.')).toBeInTheDocument();
      expect(screen.getByText('비밀번호는 최소 6자 이상이어야 합니다.')).toBeInTheDocument();
    });
    
    // API(signIn)가 호출되지 않아야 함 (프론트에서 방어됨)
    expect(signIn).not.toHaveBeenCalled();
  });

  it('올바른 형식 입력 후 API 호출 확인 (로딩 상태 점검)', async () => {
    (signIn as jest.Mock).mockResolvedValue({ error: null, ok: true });
    
    render(<LoginPage />);
    
    const idInput = screen.getByPlaceholderText('아이디 입력');
    const pwdInput = screen.getByPlaceholderText('비밀번호 입력');
    const submitButton = screen.getByRole('button', { name: /로그인 및 인증 시작/i });
    
    // 값 입력
    await userEvent.type(idInput, 'admin');
    await userEvent.type(pwdInput, 'admin123!');
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        redirect: false,
        username: 'admin',
        password: 'admin123!',
      });
    });
  });
});
