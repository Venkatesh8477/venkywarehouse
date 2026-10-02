export default function ProductsPage() {
  return (
    <div className="page-layout">
      <div className="page-header">
        <div>
          <p className="eyebrow">Catalog</p>
          <h2>Products</h2>
        </div>
        <button className="primary-button" type="button">Add product</button>
      </div>

      <div className="filters-row">
        <input type="search" placeholder="Search products" />
        <select>
          <option>All categories</option>
        </select>
        <select>
          <option>All warehouses</option>
        </select>
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
            <tr>
              <td colSpan="5" className="empty-state-cell">
                No products yet. Add inventory items to begin tracking stock.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
