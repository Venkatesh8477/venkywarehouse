export default function ReportsPage() {
  return (
    <div className="page-layout">
      <div className="page-header">
        <div>
          <p className="eyebrow">Analytics</p>
          <h2>Reports</h2>
        </div>
      </div>

      <div className="card-grid three-up">
        <article className="panel">
          <h3>Inventory report</h3>
          <p>No report data yet.</p>
        </article>
        <article className="panel">
          <h3>Low-stock report</h3>
          <p>No low-stock items flagged.</p>
        </article>
        <article className="panel">
          <h3>Movement report</h3>
          <p>No stock activity recorded.</p>
        </article>
      </div>
    </div>
  );
}
