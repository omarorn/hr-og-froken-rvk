
import { createBrowserRouter } from 'react-router-dom';
import NotFound from './pages/NotFound';
import BusTracking from './pages/BusTracking';
import Index from './pages/Index';

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
]);
