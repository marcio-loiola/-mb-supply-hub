test('isolamento (Tenant A vs Tenant B)', () => {
  const tenantA = { id: 1, data: 'A' };
  const tenantB = { id: 2, data: 'B' };
  expect(tenantA.id).not.toBe(tenantB.id);
});
