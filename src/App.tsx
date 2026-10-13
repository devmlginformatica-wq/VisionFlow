import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppShell } from './core/shell/AppShell'
import { kStr, shellRoutes } from './core/shell/shell.constants'
import { ShellPlaceholderPage } from './core/shell/pages/ShellPlaceholderPage'
import { LoginPage } from './features/auth/presentation/pages/LoginPage'
import { RequireAuth } from './features/auth/presentation/components/RequireAuth'
import { HomePage } from './features/home/presentation/pages/HomePage'
import { ClienteListaPage } from './features/cliente/presentation/pages/ClienteListaPage'
import { ClienteEditorPage } from './features/cliente/presentation/pages/ClienteEditorPage'
import { PedidoTipo } from './features/pedido/domain/entities/PedidoTipo'
import { PedidoEditorPage } from './features/pedido/presentation/pages/PedidoEditorPage'
import { PedidoListaPage } from './features/pedido/presentation/pages/PedidoListaPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RequireAuth><AppShell /></RequireAuth>,
    children: [
      { index: true, element: <HomePage /> },
      { path: shellRoutes.budget.slice(1), element: <PedidoListaPage tipo={PedidoTipo.Orcamento} /> },
      { path: `${shellRoutes.budget.slice(1)}/novo`, element: <PedidoEditorPage tipo={PedidoTipo.Orcamento} /> },
      { path: `${shellRoutes.budget.slice(1)}/:id`, element: <PedidoEditorPage tipo={PedidoTipo.Orcamento} /> },
      { path: shellRoutes.orders.slice(1), element: <PedidoListaPage tipo={PedidoTipo.Pedido} /> },
      { path: `${shellRoutes.orders.slice(1)}/novo`, element: <PedidoEditorPage tipo={PedidoTipo.Pedido} /> },
      { path: `${shellRoutes.orders.slice(1)}/:id`, element: <PedidoEditorPage tipo={PedidoTipo.Pedido} /> },
      { path: shellRoutes.clients.slice(1), element: <ClienteListaPage /> },
      { path: `${shellRoutes.clients.slice(1)}/novo`, element: <ClienteEditorPage /> },
      { path: `${shellRoutes.clients.slice(1)}/:id`, element: <ClienteEditorPage /> },
      { path: shellRoutes.agenda.slice(1), element: <ShellPlaceholderPage title={kStr.agenda} description={kStr.routeDescription} /> },
      { path: shellRoutes.tasks.slice(1), element: <ShellPlaceholderPage title={kStr.tasks} description={kStr.routeDescription} /> },
      { path: shellRoutes.taskAlias.slice(1), element: <ShellPlaceholderPage title={kStr.tasks} description={kStr.routeDescription} /> },
      { path: shellRoutes.geolocation.slice(1), element: <ShellPlaceholderPage title={kStr.geolocation} description={kStr.routeDescription} /> },
      { path: shellRoutes.dashboard.slice(1), element: <ShellPlaceholderPage title={kStr.dashboard} description={kStr.routeDescription} /> },
      { path: shellRoutes.notifications.slice(1), element: <ShellPlaceholderPage title={kStr.notifications} description={kStr.routeDescription} /> },
    ],
  },
  { path: shellRoutes.login, element: <LoginPage /> },
])

export default function App(): React.JSX.Element {
  return <RouterProvider router={router} />
}
