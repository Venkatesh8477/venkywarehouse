import { useState } from 'react';
import api from '../services/api';
import useApiData from '../hooks/useApiData';

export default function ProductsPage() {
  const { data: products, loading, error, reload } = useApiData('/inventory/products', []);
  const { data: warehouses } = useApiData('/inventory/warehouses', []);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    sku: '', name: '', category: '', unitPrice: '', reorderLevel: '0', warehouseCode: '', initialQuantity: '0',
  });
  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(search.toLowerCase()),
  );

  const submitProduct = async (event) => {
    event.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await api.post('/inventory/products', form);
      setShowForm(false);
      setForm({ sku: '', name: '', category: '', unitPrice: '', reorderLevel: '0', warehouseCode: '', initialQuantity: '0' });
      reload();
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || 'Could not create the product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-layout">
      <div className="page-header">
        <div>
          <p className="eyebrow">Catalog</p>
          <h2>Products</h2>
        </div>
        <button className="primary-button" type="button" onClick={() => setShowForm(true)}>Add product</button>
      </div>

      <div className="filters-row">
        <input type="search" placeholder="Search products" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      <div className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Warehouse</th>
              <th>Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {error && <tr><td colSpan="5" className="empty-state-cell">{error}</td></tr>}
            {loading && <tr><td colSpan="5" className="empty-state-cell">Loading products...</td></tr>}
            {!loading && !error && filteredProducts.length === 0 && (
              <tr><td colSpan="5" className="empty-state-cell">No matching products.</td></tr>
            )}
            {filteredProducts.map((product) => (
              <tr key={`${product.sku}-${product.warehouse_name}`}>
                <td>{product.name}<br /><small>{product.category}</small></td>
                <td>{product.sku}</td>
                <td>{product.warehouse_name || 'Unassigned'}</td>
                <td>{product.quantity}</td>
                <td>{product.quantity <= product.reorder_level ? 'Low stock' : 'In stock'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-backdrop">
          <section className="form-dialog" role="dialog" aria-modal="true" aria-labelledby="product-form-title">
            <h3 id="product-form-title">Add product</h3>
            <form className="modal-form" onSubmit={submitProduct}>
              <label>SKU<input required value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} /></label>
              <label>Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
              <label>Category<input required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label>
              <div className="form-two-up">
                <label>Unit price<input required type="number" min="0" step="0.01" value={form.unitPrice} onChange={(event) => setForm({ ...form, unitPrice: event.target.value })} /></label>
                <label>Reorder level<input required type="number" min="0" step="1" value={form.reorderLevel} onChange={(event) => setForm({ ...form, reorderLevel: event.target.value })} /></label>
              </div>
              <div className="form-two-up">
                <label>Opening warehouse<select value={form.warehouseCode} onChange={(event) => setForm({ ...form, warehouseCode: event.target.value })}><option value="">None</option>{warehouses.map((warehouse) => <option key={warehouse.code} value={warehouse.code}>{warehouse.name}</option>)}</select></label>
                <label>Opening quantity<input type="number" min="0" step="1" value={form.initialQuantity} onChange={(event) => setForm({ ...form, initialQuantity: event.target.value })} /></label>
              </div>
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? 'Saving...' : 'Save product'}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
