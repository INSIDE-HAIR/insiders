import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

// This would typically come from a database or CMS
// For now, we'll use static data as examples
const adminPages: Record<string, any> = {
  'es': {
    'products': {
      title: 'Gestión de Productos',
      content: `
        <div class="space-y-6">
          <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 class="font-semibold text-blue-800 mb-2">🚀 Panel de Productos</h3>
            <p class="text-blue-700">Aquí puedes gestionar todos los productos de la plataforma.</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="bg-white p-4 rounded-lg border shadow-sm">
              <h4 class="font-medium mb-2">📦 Productos Activos</h4>
              <p class="text-2xl font-bold text-green-600">156</p>
            </div>
            <div class="bg-white p-4 rounded-lg border shadow-sm">
              <h4 class="font-medium mb-2">🛠️ En Desarrollo</h4>
              <p class="text-2xl font-bold text-yellow-600">23</p>
            </div>
            <div class="bg-white p-4 rounded-lg border shadow-sm">
              <h4 class="font-medium mb-2">📈 Ventas del Mes</h4>
              <p class="text-2xl font-bold text-blue-600">€45,230</p>
            </div>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-gray-600">💡 <strong>Próximas funcionalidades:</strong> Gestión avanzada de inventario, análisis de rendimiento por producto, y integración con sistemas de terceros.</p>
          </div>
        </div>
      `,
      metadata: {
        description: 'Gestiona productos, inventario y ventas',
        lastUpdated: '2025-01-01',
        status: 'Activo'
      }
    },
    'users': {
      title: 'Gestión de Usuarios',
      content: `
        <div class="space-y-6">
          <div class="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 class="font-semibold text-green-800 mb-2">👥 Panel de Usuarios</h3>
            <p class="text-green-700">Administra usuarios, roles y permisos del sistema.</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white p-4 rounded-lg border shadow-sm">
              <h4 class="font-medium mb-2">👤 Total Usuarios</h4>
              <p class="text-2xl font-bold text-blue-600">1,234</p>
            </div>
            <div class="bg-white p-4 rounded-lg border shadow-sm">
              <h4 class="font-medium mb-2">🟢 Activos</h4>
              <p class="text-2xl font-bold text-green-600">1,187</p>
            </div>
            <div class="bg-white p-4 rounded-lg border shadow-sm">
              <h4 class="font-medium mb-2">👑 Administradores</h4>
              <p class="text-2xl font-bold text-purple-600">12</p>
            </div>
            <div class="bg-white p-4 rounded-lg border shadow-sm">
              <h4 class="font-medium mb-2">📅 Nuevos (30d)</h4>
              <p class="text-2xl font-bold text-orange-600">47</p>
            </div>
          </div>
        </div>
      `,
      metadata: {
        description: 'Control total sobre usuarios y permisos',
        lastUpdated: '2025-01-01',
        status: 'Activo'
      }
    },
    'analytics': {
      title: 'Panel de Analíticas',
      content: `
        <div class="space-y-6">
          <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 class="font-semibold text-purple-800 mb-2">📊 Centro de Analíticas</h3>
            <p class="text-purple-700">Métricas detalladas y reportes de rendimiento.</p>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white p-6 rounded-lg border shadow-sm">
              <h4 class="font-semibold mb-4">📈 Rendimiento General</h4>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span>Visitantes únicos</span>
                  <span class="font-bold">12,456</span>
                </div>
                <div class="flex justify-between">
                  <span>Páginas vistas</span>
                  <span class="font-bold">45,789</span>
                </div>
                <div class="flex justify-between">
                  <span>Tiempo promedio</span>
                  <span class="font-bold">3m 42s</span>
                </div>
              </div>
            </div>
            
            <div class="bg-white p-6 rounded-lg border shadow-sm">
              <h4 class="font-semibold mb-4">🎯 Conversiones</h4>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span>Tasa de conversión</span>
                  <span class="font-bold text-green-600">3.2%</span>
                </div>
                <div class="flex justify-between">
                  <span>Leads generados</span>
                  <span class="font-bold">789</span>
                </div>
                <div class="flex justify-between">
                  <span>Ventas completadas</span>
                  <span class="font-bold">156</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
      metadata: {
        description: 'Insights y métricas para tomar decisiones',
        lastUpdated: '2025-01-01',
        status: 'Activo'
      }
    }
  },
  'en': {
    'products': {
      title: 'Product Management',
      content: `
        <div class="space-y-6">
          <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 class="font-semibold text-blue-800 mb-2">🚀 Product Dashboard</h3>
            <p class="text-blue-700">Here you can manage all platform products.</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="bg-white p-4 rounded-lg border shadow-sm">
              <h4 class="font-medium mb-2">📦 Active Products</h4>
              <p class="text-2xl font-bold text-green-600">156</p>
            </div>
            <div class="bg-white p-4 rounded-lg border shadow-sm">
              <h4 class="font-medium mb-2">🛠️ In Development</h4>
              <p class="text-2xl font-bold text-yellow-600">23</p>
            </div>
            <div class="bg-white p-4 rounded-lg border shadow-sm">
              <h4 class="font-medium mb-2">📈 Monthly Sales</h4>
              <p class="text-2xl font-bold text-blue-600">€45,230</p>
            </div>
          </div>
        </div>
      `,
      metadata: {
        description: 'Manage products, inventory and sales',
        lastUpdated: '2025-01-01',
        status: 'Active'
      }
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const lang = searchParams.get('lang') || 'es'
    const slug = searchParams.get('slug') || ''

    // Get user role and check permissions
    const userRole = (session.user as any).role || 'user'
    
    if (!['admin', 'super-admin', 'editor'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Try to find page data
    const langPages = adminPages[lang as keyof typeof adminPages]
    if (!langPages) {
      return NextResponse.json({ error: 'Language not supported' }, { status: 404 })
    }

    // Get the first part of slug as the main route
    const mainRoute = slug.split('/')[0]
    const pageData = langPages[mainRoute]

    if (!pageData) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    return NextResponse.json(pageData)
    
  } catch (error) {
    console.error('Error in admin pages API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}