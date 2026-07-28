import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AnimatePresence } from 'framer-motion';

import { StudyProvider } from '@/context/StudyContext';
import { Navbar } from '@/components/Navbar';
import NotFound from '@/pages/not-found';

import Landing from '@/pages/landing';
import Dashboard from '@/pages/dashboard';
import Planner from '@/pages/planner';
import Focus from '@/pages/focus';
import History from '@/pages/history';
import Achievements from '@/pages/achievements';

const queryClient = new QueryClient();

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/planner" component={Planner} />
        <Route path="/focus" component={Focus} />
        <Route path="/history" component={History} />
        <Route path="/achievements" component={Achievements} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StudyProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <div className="min-h-[100dvh] flex flex-col bg-background text-foreground overflow-x-hidden">
            <Navbar />
            <main className="flex-1 flex flex-col w-full relative z-10">
              <Router />
            </main>
          </div>
        </WouterRouter>
      </StudyProvider>
    </QueryClientProvider>
  );
}

export default App;
