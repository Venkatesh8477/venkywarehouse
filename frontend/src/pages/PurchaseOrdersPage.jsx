import useApiData from '../hooks/useApiData';

export default function PurchaseOrdersPage() {
  const { data: orders, loading, error } = useApiData('/inventory/purchase-orders', []);

  return (
    <div className="page-layout">
      <div className="page-header">
        <div>
          <p className="eyebrow">Procurement workflow</p>
          <h2>Purchase orders</h2>
        </div>
        <button className="primary-button" type="button">Create PO</button>
      </div>

      <div className="table-panel">
        <table>
          <thead>
            <tr>
              <th>PO #</th>
              <th>Supplier</th>
              <th>Warehouse</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {error && <tr><td colSpan="5" className="empty-state-cell">{error}</td></tr>}
            {loading && <tr><td colSpan="5" className="empty-state-cell">Loading purchase orders...</td></tr>}
            {!loading && !error && orders.length === 0 && <tr><td colSpan="5" className="empty-state-cell">No purchase orders yet.</td></tr>}
            {orders.map((order) => (
              <tr key={order.order_number}>
                <td>{order.order_number}</td>
                <td>{order.supplier_name}</td>
                <td>{order.warehouse_name}</td>
                <td>{order.status.replaceAll('_', ' ')}</td>
                <td>${Number(order.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
