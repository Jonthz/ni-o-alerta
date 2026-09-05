import { useState } from 'react';
import { Button } from './components/Button';
import { CoeView } from './CoeView';
import { PromotorView } from './PromotorView';
import { VecinoView } from './VecinoView';
import { WhatsappView } from './WhatsappView';

type Panel = 'whatsapp' | 'app' | 'promotor';

export function DemoView() {
  const [panel, setPanel] = useState<Panel>('whatsapp');
  return (
    <main className="demo">
      <section className="demo-left">
        <header className="demo-header">
          <strong>Modo demostracion</strong>
          <div className="demo-tabs">
            <Button variant={panel === 'whatsapp' ? 'default' : 'outline'} size="sm" onClick={() => setPanel('whatsapp')}>WhatsApp</Button>
            <Button variant={panel === 'app' ? 'default' : 'outline'} size="sm" onClick={() => setPanel('app')}>App offline</Button>
            <Button variant={panel === 'promotor' ? 'default' : 'outline'} size="sm" onClick={() => setPanel('promotor')}>Promotor</Button>
          </div>
        </header>
        <div className="demo-panel">
          {panel === 'whatsapp' ? <WhatsappView /> : panel === 'promotor' ? <PromotorView compact /> : <VecinoView demoControls />}
        </div>
      </section>
      <section className="demo-right">
        <CoeView embedded />
      </section>
    </main>
  );
}
