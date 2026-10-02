import { useState } from 'react';
import api from '../services/api';
import useApiData from '../hooks/useApiData';

export default function SuppliersPage() {
  const { data: suppliers, loading, error, reload } = useApiData('/inventory/suppliers', []);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', email: '', phone: '', address: '' });

  const submitSupplier = async (event) => {
    event.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await api.post('/inventory/suppliers', form);
      setShowForm(false);
      setForm({ code: '', name: '', email: '', phone: '', address: '' });
      reload();
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || 'Could not create the supplier.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-layout">
      <div className="page-header">
        <div>
          <p className="eyebrow">Procurement</p>
          <h2>Suppliers</h2>
        </div>
        <button className="primary-button" type="button" onClick={() => setShowForm(true)}>Add supplier</button>
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
            {error && <tr><td colSpan="4" className="empty-state-cell">{error}</td></tr>}
            {loading && <tr><td colSpan="4" className="empty-state-cell">Loading suppliers...</td></tr>}
            {!loading && !error && suppliers.length === 0 && <tr><td colSpan="4" className="empty-state-cell">No suppliers available.</td></tr>}
            {suppliers.map((supplier) => (
              <tr key={supplier.code}>
                <td>{supplier.name}</td>
                <td>{supplier.email}</td>
                <td>{supplier.phone}</td>
                <td>{supplier.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-backdrop">
          <section className="form-dialog" role="dialog" aria-modal="true" aria-labelledby="supplier-form-title">
            <h3 id="supplier-form-title">Add supplier</h3>
            <form className="modal-form" onSubmit={submitSupplier}>
              <label>Supplier code<input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} /></label>
              <label>Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
              <label>Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
              <label>Phone<input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
              <label>Address<input required value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label>
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? 'Saving...' : 'Save supplier'}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
