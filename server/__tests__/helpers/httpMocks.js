const createMockRes = () => {
  const res = {};
  res.statusCode = 200;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const createMockReq = (overrides = {}) => ({
  body: {},
  params: {},
  headers: {},
  user: null,
  ip: "127.0.0.1",
  method: "GET",
  originalUrl: "/test",
  get: jest.fn().mockReturnValue("jest-agent"),
  ...overrides,
});

module.exports = {
  createMockReq,
  createMockRes,
};
