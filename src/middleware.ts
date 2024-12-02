import { chain } from '@/src/middleware/chain';
import { withI18nMiddleware } from '@/src/middleware/withI18nMiddleware';
import { withAuthMiddleware } from '@/src/middleware/withAuthMiddleware';

export default chain([
  withI18nMiddleware,
  withAuthMiddleware
]);

export const config = {
  matcher: [
    // Excluir archivos estáticos y rutas de API
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
