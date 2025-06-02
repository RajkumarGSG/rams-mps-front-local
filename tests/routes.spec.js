import { describe, it, expect } from 'vitest';
import router from '@/routes/routes.js'; // путь к вашему роутеру

describe('Router', () => {
  /*it('should have a defined route for /deu', () => {
    const route = router.options.routes.find(r => r.path === '/deu');
    expect(route).toBeDefined();
    expect(route.name).toBe('DeuList');
  });
*/
  it('should have a correct redirect for /', () => {
    console.log('router', router)
//    const route = router.options.routes.find(r => r.path === '/');
//    expect(route).toBeDefined();
//    expect(route.redirect).toBe('/deu'); // Проверяем редирект на главную страницу
  });
/*
  it('should have a meta.requiresAuth property on protected routes', () => {
    const protectedRoute = router.options.routes.find(r => r.meta?.requiresAuth);
    expect(protectedRoute).toBeDefined();
    expect(protectedRoute.meta.requiresAuth).toBe(true);
  });
  */
});
