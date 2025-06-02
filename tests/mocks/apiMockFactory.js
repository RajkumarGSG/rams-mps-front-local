import { vi } from 'vitest';

export const createApiMock = (methods) => {
  const apiMock = {};
  methods.forEach((method) => {
    apiMock[method] = vi.fn();
  });
  return { default: apiMock };
};

export const createApiMock_new = (name) => ({
  loadList: vi.fn(() => Promise.resolve([{ id: 1, name: `${name} 1` }])),
  loadById: vi.fn((id) => Promise.resolve({ id, name: `${name} ${id}` })),
  addNew: vi.fn((item) => Promise.resolve({ id: 99, ...item })),
  update: vi.fn((id, item) => Promise.resolve({ id, ...item })),
  delete: vi.fn(() => Promise.resolve({ success: true }))
});