export default function HomePage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>校园宝 API</h1>
      <p>Campus Treasure Backend Service</p>
      <hr />
      <h2>API Endpoints</h2>
      <ul>
        <li>
          <code>GET /api/health</code> - 健康检查
        </li>
        <li>
          <code>POST /api/auth/login</code> - 用户登录
        </li>
        <li>
          <code>GET /api/items</code> - 获取物品列表
        </li>
      </ul>
    </main>
  );
}
