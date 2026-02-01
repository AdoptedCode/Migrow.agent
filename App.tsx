import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { IntegrationView } from './views/IntegrationView';
import { LogsView } from './views/LogsView';
import { View } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.INTEGRATION);

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <DashboardView />;
      case View.LOGS:
        return <LogsView />;
      case View.INTEGRATION:
        return <IntegrationView />;
      default:
        return <IntegrationView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 h-full overflow-y-auto bg-slate-900 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950">
        <div className="p-8 max-w-7xl mx-auto h-full">
           {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;