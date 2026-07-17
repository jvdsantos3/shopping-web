import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { ConfirmationPage } from './pages/ConfirmationPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { MyPurchaseRequestsPage } from './pages/MyPurchaseRequestsPage'
import { NewPurchaseRequestPage } from './pages/NewPurchaseRequestPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/solicitacoes" element={<MyPurchaseRequestsPage />} />
        <Route path="/solicitacoes/nova" element={<NewPurchaseRequestPage />} />
        <Route path="/solicitacoes/:id/confirmacao" element={<ConfirmationPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
