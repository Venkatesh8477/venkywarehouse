import useApiData from '../hooks/useApiData';

export default function ReportsPage() {
  const { data, loading, error } = useApiData('/inventory/reports', {
    summary: {},
    categories: [],
  });
  const summary = data.summary || {};

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
          <p>{loading ? 'Loading...' : `Inventory value: $${Number(summary.inventory_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}</p>
          {data.categories.map((category) => <p key={category.category}>{category.category}: {category.quantity} units</p>)}
        </article>
        <article className="panel">
          <h3>Low-stock report</h3>
          <p>{loading ? 'Loading...' : `${summary.low_stock_products || 0} product/warehouse combinations need replenishment.`}</p>
        </article>
        <article className="panel">
          <h3>Movement report</h3>
          {error && <p role="alert">{error}</p>}
          <p>{loading ? 'Loading...' : `${summary.movement_count || 0} stock movements recorded.`}</p>
        </article>
      </div>
    </div>
  );
}
