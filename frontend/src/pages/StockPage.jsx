export default function StockPage() {
  return (
    <div className="page-layout">
      <div className="page-header">
        <div>
          <p className="eyebrow">Inventory activity</p>
          <h2>Stock movements</h2>
        </div>
        <div className="action-group">
          <button className="secondary-button" type="button">Stock IN</button>
          <button className="primary-button" type="button">Stock OUT</button>
        </div>
      </div>

      <div className="panel">
        <h3>Movement history</h3>
        <div className="empty-box">No stock transactions have been recorded.</div>
      </div>
    </div>
  );
}
