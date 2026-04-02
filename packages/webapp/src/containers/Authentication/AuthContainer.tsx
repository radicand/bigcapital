// @ts-nocheck
import styled from 'styled-components';
import { Icon, FormattedMessage as T } from '@/components';

interface AuthContainerProps {
  children: React.ReactNode;
}

export function AuthContainer({ children }: AuthContainerProps) {
  return (
    <AuthPage>
      <AuthInsider>
        <AuthLogo>
          <Icon icon="bigcapital" height={37} width={214} />
        </AuthLogo>

        {children}
      </AuthInsider>
    </AuthPage>
  );
}

const AuthPage = styled.div``;
const AuthInsider = styled.div`
  width: min(384px, calc(100vw - 32px));
  max-width: 100%;
  margin: 0 auto;
  margin-bottom: 40px;
  padding-top: 80px;

  @media (max-width: 768px) {
    padding-top: 32px;
  }
`;

const AuthLogo = styled.div`
  text-align: center;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`;
