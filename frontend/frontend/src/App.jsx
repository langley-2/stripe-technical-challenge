import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Checkout from './pages/Checkout'
import PaymentAcknowledged from './pages/PaymentAcknowledged'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/payment-acknowledged" element={<PaymentAcknowledged />} />
    </Routes>
  )
}
