import { StoreProvider } from '../store';
import { CoeView } from './CoeView';
import { DemoView } from './DemoView';
import { PromotorView } from './PromotorView';
import { VecinoView } from './VecinoView';
import { WhatsappView } from './WhatsappView';

const links = [
  ['/vecino', 'Vecino'],
  ['/whatsapp', 'WhatsApp'],
  ['/promotor', 'Promotor'],
  ['/coe', 'COE'],
  ['/demo', 'Demo'],
];

export function App() {
  const path = window.location.pathname === '/' ? '/vecino' : window.location.pathname;
  return (
    <StoreProvider>
      {path !== '/demo' && (
        <nav className="role-nav">
          <strong>TESTIGO</strong>
          {links.map(([href, label]) => <a className={path === href ? 'active' : ''} href={href} key={href}>{label}</a>)}
        </nav>
      )}
      {path === '/demo' ? <DemoView /> : path === '/coe' ? <CoeView /> : path === '/promotor' ? <PromotorView /> : path === '/whatsapp' ? <WhatsappView /> : <VecinoView />}
    </StoreProvider>
  );
}
