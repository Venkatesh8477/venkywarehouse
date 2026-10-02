import { useState } from 'react';
import api from '../services/api';
import useApiData from '../hooks/useApiData';

export default function StockPage() {
  const { data: movements, loading, error, reload } = useApiData('/inventory/stock', []);
  const { data: products } = useApiData('/inventory/products', []);
  const { data: warehouses } = useApiData('/inventory/warehouses', []);
  const [movementType, setMovementType] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ sku: '', warehouseCode: '', quantity: '', notes: '' });
  const uniqueProducts = [...new Map(products.map((product) => [product.sku, product])).values()];

  const openMovementForm = (type) => {
    setMovementType(type);
    setFormError('');
    setForm({ sku: '', warehouseCode: '', quantity: '', notes: '' });
  };

  const submitMovement = async (event) => {
    event.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await api.post('/inventory/stock', { ...form, movementType });
      setMovementType('');
      setForm({ sku: '', warehouseCode: '', quantity: '', notes: '' });
      reload();
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || 'Could not record the stock movement.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-layout">
      <div className="page-header">
        <div>
          <p className="eyebrow">Inventory activity</p>
          <h2>Stock movements</h2>
        </div>
        <div className="action-group">
          <button className="secondary-button" type="button" onClick={() => openMovementForm('IN')}>Stock IN</button>
          <button className="primary-button" type="button" onClick={() => openMovementForm('OUT')}>Stock OUT</button>
        </div>
      </div>

      <div className="panel">
        <h3>Movement history</h3>
        {error && <p role="alert">{error}</p>}
        {loading && <p>Loading movements...</p>}
        {!loading && !error && movements.length === 0 && <div className="empty-box">No stock transactions have been recorded.</div>}
        {movements.length > 0 && (
          <div className="table-panel">
            <table>
              <thead><tr><th>Reference</th><th>Product</th><th>Warehouse</th><th>Type</th><th>Quantity</th><th>Notes</th></tr></thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.reference}>
                    <td>{movement.reference}</td>
                    <td>{movement.product_name}</td>
                    <td>{movement.warehouse_name}</td>
                    <td>{movement.movement_type}</td>
                    <td>{movement.quantity}</td>
                    <td>{movement.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {movementType && (
        <div className="modal-backdrop">
          <section className="form-dialog" role="dialog" aria-modal="true" aria-labelledby="stock-form-title">
            <h3 id="stock-form-title">Stock {movementType}</h3>
            <form className="modal-form" onSubmit={submitMovement}>
              <label>Product<select required value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })}><option value="">Select product</option>{uniqueProducts.map((product) => <option key={product.sku} value={product.sku}>{product.sku} · {product.name}</option>)}</select></label>
              <label>Warehouse<select required value={form.warehouseCode} onChange={(event) => setForm({ ...form, warehouseCode: event.target.value })}><option value="">Select warehouse</option>{warehouses.map((warehouse) => <option key={warehouse.code} value={warehouse.code}>{warehouse.name}</option>)}</select></label>
              <label>Quantity<input required type="number" min="1" step="1" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} /></label>
              <label>Notes<input value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setMovementType('')}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? 'Saving...' : `Record stock ${movementType}`}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
