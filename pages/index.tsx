/**
 * Home page - shows API documentation
 */
export default function Home() {
  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <h1>🔔 Notification & Announcement System</h1>
      <p>Backend API service for the FitHub platform.</p>

      <h2>Available Endpoints:</h2>

      <h3>Health Check</h3>
      <code>GET /api/_health</code>
      <p>Returns system status and uptime.</p>

      <h3>Send Notification</h3>
      <code>POST /api/notifications/send</code>
      <p>Send a notification to a single recipient via EMAIL or SMS.</p>
      <p><strong>Auth:</strong> Requires <code>X-API-Key</code> header</p>

      <h3>Broadcast Announcement</h3>
      <code>POST /api/announcements/broadcast</code>
      <p>Broadcast a message to multiple members in an audience segment.</p>
      <p><strong>Auth:</strong> Requires <code>X-API-Key</code> header</p>

      <h3>List Endpoints</h3>
      <ul>
        <li><code>GET /api/notifications</code> - List notification endpoints</li>
        <li><code>GET /api/announcements</code> - List announcement endpoints</li>
      </ul>

      <hr style={{ margin: '30px 0' }} />

      <p><strong>Team:</strong> Communications Team</p>
      <p><strong>Course:</strong> CPS714 - Software Engineering</p>
    </div>
  );
}
