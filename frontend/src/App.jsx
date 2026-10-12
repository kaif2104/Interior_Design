import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Portfolio from './pages/Portfolio';
import PortfolioDetail from './pages/PortfolioDetail';
import BookConsultation from './pages/BookConsultation';
import Billing from './pages/Billing';
import Feedback from './pages/Feedback';
import Items from './pages/Items';
import AdminDashboard from './pages/AdminDashboard';
import MyOrders from './pages/MyOrders';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <CartDrawer />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/:id" element={<PortfolioDetail />} />
            <Route path="/items" element={<Items />} />
            <Route
              path="/book-consultation"
              element={<BookConsultation />}
            />
            <Route path="/billing" element={<Billing />} />

            {/* My Orders */}
            <Route path="/my-orders" element={<MyOrders />} />

            <Route path="/feedback" element={<Feedback />} />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
