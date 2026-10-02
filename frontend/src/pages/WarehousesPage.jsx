export default function WarehousesPage() {
  return (
    <div className="page-layout">
      <div className="page-header">
        <div>
          <p className="eyebrow">Facilities</p>
          <h2>Warehouses</h2>
        </div>
        <button className="primary-button" type="button">Add warehouse</button>
      </div>

      <div className="card-grid two-up">
        <article className="panel">
          <h3>Primary warehouse</h3>
          <p>Location: Pending setup</p>
          <p>Capacity: Pending setup</p>
        </article>
        <article className="panel">
          <h3>Secondary warehouse</h3>
          <p>Location: Pending setup</p>
          <p>Capacity: Pending setup</p>
        </article>
      </div>
    </div>
  );
}
