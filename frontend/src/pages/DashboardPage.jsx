export default function DashboardPage() {
  return (
    <div className="page-grid">
      <section className="card-grid three-up">
        <article className="stat-card">
          <span>Total products</span>
          <strong>0</strong>
        </article>
        <article className="stat-card">
          <span>Total stock quantity</span>
          <strong>0</strong>
        </article>
        <article className="stat-card">
          <span>Low-stock alerts</span>
          <strong>0</strong>
        </article>
      </section>

      <section className="panel">
        <h3>Recent stock movements</h3>
        <div className="empty-box">No movements available yet.</div>
      </section>
    </div>
  );
}
