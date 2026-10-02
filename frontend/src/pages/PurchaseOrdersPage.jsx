export default function PurchaseOrdersPage() {
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
            <tr>
              <td colSpan="5" className="empty-state-cell">
                No purchase orders yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
