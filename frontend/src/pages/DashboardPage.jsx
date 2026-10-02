import useApiData from '../hooks/useApiData';

export default function DashboardPage() {
  const { data, loading, error } = useApiData('/inventory/dashboard', {
    totals: {},
    movements: [],
  });
  const totals = data.totals || {};

  return (
    <div className="page-grid">
      <section className="card-grid three-up">
        <article className="stat-card">
          <span>Total products</span>
          <strong>{loading ? '...' : totals.total_products ?? 0}</strong>
        </article>
        <article className="stat-card">
          <span>Total stock quantity</span>
          <strong>{loading ? '...' : totals.total_stock_quantity ?? 0}</strong>
        </article>
        <article className="stat-card">
          <span>Low-stock alerts</span>
          <strong>{loading ? '...' : totals.low_stock_alerts ?? 0}</strong>
        </article>
      </section>

      <section className="panel">
        <h3>Recent stock movements</h3>
        {error && <p role="alert">{error}</p>}
        {!loading && !error && data.movements.length === 0 && (
          <div className="empty-box">No movements available yet.</div>
        )}
        {data.movements.length > 0 && (
          <div className="table-panel">
            <table>
              <thead>
                <tr><th>Product</th><th>Warehouse</th><th>Type</th><th>Quantity</th><th>Reference</th></tr>
              </thead>
              <tbody>
                {data.movements.map((movement) => (
                  <tr key={movement.reference}>
                    <td>{movement.product_name}</td>
                    <td>{movement.warehouse_name}</td>
                    <td>{movement.movement_type}</td>
                    <td>{movement.quantity}</td>
                    <td>{movement.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
