import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { HomePage } from './components/homePage/HomePage'
import { Register } from './components/register/Register'
import { ControlPanel } from './components/controlPanel/ControlPanel'
import { ForgotPassword, ResetPassword } from './components/forgotPassword/ForgotPassword'
import { FormularioDinamico } from './components/formularioDinamico/FormularioDinamico'
import { RegisterPage } from './components/register/RegisterPage'
import { MeusPedidos } from './components/controlPanel/MeusPedidos'
import { VisualizarPedidoCurriculo } from './components/servicosForm/curriculo'
import { AcessarPedido } from './components/controlPanelAdmin/AcessarPedido'
import { EnviarMensagem } from './components/controlPanel/EnviarMensagem'

function App() {

  return (
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<RegisterPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/resetpassword/:token" element={<ResetPassword />} />
            <Route path="/:nick" element={<ControlPanel />} />
            <Route path="/meus-pedidos" element={<MeusPedidos />} />
            <Route path="/pedido/:id" element={<AcessarPedido />} />
            <Route path="/formulario/:serviceName" element={<FormularioDinamico />} />
            <Route path="/formulario/:id/view" element={<VisualizarPedidoCurriculo />} />
            <Route path="/messages" element={<EnviarMensagem />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
  )
}

export default App
