import useApiData from '../hooks/useApiData';

export default function WarehousesPage() {
  const { data: warehouses, loading, error } = useApiData('/inventory/warehouses', []);

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
        {error && <p role="alert">{error}</p>}
        {loading && <p>Loading warehouses...</p>}
        {!loading && !error && warehouses.map((warehouse) => (
          <article className="panel" key={warehouse.code}>
            <h3>{warehouse.name}</h3>
            <p>Location: {warehouse.location}</p>
            <p>Stocked units: {warehouse.used_units.toLocaleString()} / {warehouse.capacity_units.toLocaleString()}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
