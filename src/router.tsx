
import { createBrowserRouter } from 'react-router-dom';
import NotFound from './pages/NotFound';
import BusTracking from './pages/BusTracking';
import Index from './pages/Index';
import AIPhoneAgent from './pages/AIPhoneAgent';
import AIPhoneLanding from './pages/AIPhoneLanding';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    errorElement: <NotFound />,
  },
  {
    path: "/bus-tracking",
    element: <BusTracking />,
  },
  {
    path: "/ai-phone-agent",
    element: <AIPhoneAgent />,
  },
  {
    path: "/ai-phone-landing",
    element: <AIPhoneLanding />,
  },
]);
