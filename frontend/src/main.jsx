import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, ArrowUpRight, Boxes, CirclePlus, Package, Search, X } from 'lucide-react';
import './style.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/products';
const blankProduct = { name: '', price: '', category: '', description: '', stock: '' };
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(blankProduct);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All categories');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function refreshProducts() {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Could not load products');
      setProducts(result);
      setMessage('');
    } catch (error) {
      setMessage(`${error.message}. Check the API and database connection.`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refreshProducts(); }, []);

  const categories = ['All categories', ...new Set(products.map((product) => product.category))];
  const shownProducts = products.filter((product) => {
    const searchable = `${product.name} ${product.category} ${product.description || ''}`.toLowerCase();
    return searchable.includes(search.toLowerCase()) && (category === 'All categories' || product.category === category);
  });
  const stockValue = products.reduce((total, product) => total + product.price * product.stock, 0);
  const lowStockCount = products.filter((product) => product.stock < 10).length;

  function editProduct(product) {
    setEditingId(product._id);
    setForm({ name: product.name, price: product.price, category: product.category, description: product.description || '', stock: product.stock });
    document.querySelector('#product-name')?.focus();
  }

  function clearForm() {
    setForm(blankProduct);
    setEditingId(null);
  }

  async function saveProduct(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch(editingId ? `${API_URL}/${editingId}` : API_URL, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price: Number(form.price), stock: Number(form.stock) })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.errors?.join(', ') || result.message || 'Could not save product');
      clearForm();
      await refreshProducts();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Delete ${product.name}? This cannot be undone.`)) return;
    try {
      const response = await fetch(`${API_URL}/${product._id}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Could not delete product');
      if (editingId === product._id) clearForm();
      await refreshProducts();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Product Management System"><span className="brand-mark"><Boxes size={19} /></span><span>product management system<span className="brand-period">.</span></span></a>
      </header>
      {message && <div className="notice" role="alert">{message}<button type="button" aria-label="Dismiss message" onClick={() => setMessage('')}><X size={16} /></button></div>}
      <div className="workspace">
        <section className="catalog" aria-labelledby="catalog-title">
          <div className="toolbar">
            <label className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" aria-label="Search products" /></label>
            <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">{categories.map((item) => <option key={item}>{item}</option>)}</select>
          </div>
          <div className="table-wrap"><table>
            <thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>PRICE</th><th>STOCK</th><th aria-label="Actions" /></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="5" className="table-message">Loading products...</td></tr> : shownProducts.length === 0 ? <tr><td colSpan="5" className="table-message">{products.length ? 'No products match your search.' : 'Your catalog is empty. Add your first product to get started.'}</td></tr> : shownProducts.map((product) => (
                <tr key={product._id}>
                  <td><div className="product-cell"><span className="product-icon"><Package size={17} /></span><span><strong>{product.name}</strong><small>{product.description || 'No description'}</small></span></div></td>
                  <td><span className="category-tag">{product.category}</span></td><td className="price-cell">{money.format(product.price)}</td>
                  <td><span className={`stock-value ${product.stock < 10 ? 'stock-low' : ''}`}>{product.stock}<small> units</small></span></td>
                  <td><div className="row-actions"><button type="button" onClick={() => editProduct(product)}>Edit</button><button type="button" className="delete-action" onClick={() => deleteProduct(product)}>Delete</button></div></td>
                </tr>
              ))}
            </tbody>
          </table></div>
          <div className="table-footer"><span>Showing {shownProducts.length} of {products.length} products</span><span>PRODUCT MANAGEMENT SYSTEM <ArrowUpRight size={13} /></span></div>
        </section>
        <aside className="form-panel" id="add-product">
          <div className="form-heading"><span className="form-icon"><CirclePlus size={18} /></span><div><p className="eyebrow">{editingId ? 'UPDATE CATALOG' : 'NEW ENTRY'}</p><h2>{editingId ? 'Edit product' : 'Add product'}</h2></div></div>
          <form onSubmit={saveProduct}>
            <label className="field-label" htmlFor="product-name">Product name <span>*</span></label>
            <input id="product-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Ceramic travel mug" required maxLength="120" />
            <div className="field-row">
              <div><label className="field-label" htmlFor="product-price">Price <span>*</span></label><div className="number-input"><span>$</span><input id="product-price" type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="0.00" required /></div></div>
              <div><label className="field-label" htmlFor="product-stock">Stock <span>*</span></label><input id="product-stock" type="number" min="0" step="1" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} placeholder="0" required /></div>
            </div>
            <label className="field-label" htmlFor="product-category">Category <span>*</span></label>
            <input id="product-category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="e.g. Home & living" required maxLength="80" />
            <label className="field-label" htmlFor="product-description">Description <span className="optional">OPTIONAL</span></label>
            <textarea id="product-description" rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="A short note about this product" maxLength="500" />
            <div className="form-actions"><button className="submit-button" type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save changes' : 'Create product'} <ArrowUpRight size={16} /></button>{editingId && <button className="cancel-button" type="button" onClick={clearForm}>Cancel</button>}</div>
          </form>
          <p className="required-note"><span>*</span> Required fields</p>
        </aside>
      </div>
    </main>
  );
}

createRoot(document.getElementById('app')).render(<App />);