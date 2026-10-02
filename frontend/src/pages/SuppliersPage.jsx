export default function SuppliersPage() {
  return (
    <div className="page-layout">
      <div className="page-header">
        <div>
          <p className="eyebrow">Procurement</p>
          <h2>Suppliers</h2>
        </div>
        <button className="primary-button" type="button">Add supplier</button>
      </div>

      <div className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="4" className="empty-state-cell">
                No suppliers available.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
