import React, { useEffect, useState, useRef, useCallback } from 'react'
import {
  adminGetDashboard,
  adminGetAllOrders,
  adminUpdateOrderStatus,
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  adminGetCustomers,
} from '../api/services.js'
import { Home, ShoppingCart, Box, Users, LogOut, ArrowUp, ArrowDown } from 'lucide-react'

function Icon({ name }) {
  switch (name) {
    case 'dashboard': return <Home size={16} />
    case 'orders': return <ShoppingCart size={16} />
    case 'products': return <Box size={16} />
    case 'customers': return <Users size={16} />
    default: return null
  }
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = 880
    g.gain.value = 0.05
    o.connect(g)
    g.connect(ctx.destination)
    o.start()
    setTimeout(() => { o.stop(); ctx.close() }, 150)
  } catch (e) {
    // ignore
  }
}

export default function AdminDashboard() {
  const [active, setActive] = useState('dashboard')

  // Dashboard
  const [dash, setDash] = useState(null)
  const [dashLoading, setDashLoading] = useState(false)
  const [dashError, setDashError] = useState(null)

  // Orders
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState(null)
  const [orderFilter, setOrderFilter] = useState('')
  const prevOrderCount = useRef(0)
  const ordersInterval = useRef(null)

  // Products
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [addData, setAddData] = useState({ name: '', image: '', price: '', stock: '', note: '' })
  const [editingId, setEditingId] = useState(null)
  const [editingData, setEditingData] = useState({})

  // Customers
  const [customers, setCustomers] = useState([])
  const [customersLoading, setCustomersLoading] = useState(false)
  const [customersError, setCustomersError] = useState(null)

  // fetch dashboard
  const loadDashboard = useCallback(async () => {
    setDashLoading(true); setDashError(null)
    try {
      const res = await adminGetDashboard()
      setDash(res)
    } catch (err) {
      setDashError(typeof err === 'string' ? err : err?.message || 'Failed to load dashboard')
    } finally { setDashLoading(false) }
  }, [])

  // fetch orders
  const loadOrders = useCallback(async (status) => {
    setOrdersLoading(true); setOrdersError(null)
    try {
      const res = await adminGetAllOrders(status)
      const list = Array.isArray(res) ? res : (res?.orders || res)
      // detect new
      if (prevOrderCount.current && list.length > prevOrderCount.current) playBeep()
      prevOrderCount.current = list.length
      setOrders(list)
    } catch (err) {
      setOrdersError(typeof err === 'string' ? err : err?.message || 'Failed to load orders')
    } finally { setOrdersLoading(false) }
  }, [])

  // fetch products
  const loadProducts = useCallback(async () => {
    setProductsLoading(true); setProductsError(null)
    try {
      const res = await getAllProducts()
      const list = Array.isArray(res) ? res : (res?.products || res)
      setProducts(list)
    } catch (err) {
      setProductsError(typeof err === 'string' ? err : err?.message || 'Failed to load products')
    } finally { setProductsLoading(false) }
  }, [])

  // fetch customers
  const loadCustomers = useCallback(async () => {
    setCustomersLoading(true); setCustomersError(null)
    try {
      const res = await adminGetCustomers()
      const list = res?.customers || res || []
      // sort by total spent desc
      list.sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))
      setCustomers(list)
    } catch (err) {
      setCustomersError(typeof err === 'string' ? err : err?.message || 'Failed to load customers')
    } finally { setCustomersLoading(false) }
  }, [])

  useEffect(() => { loadDashboard(); loadOrders(); loadProducts(); loadCustomers(); }, [loadDashboard, loadOrders, loadProducts, loadCustomers])

  // orders auto-refresh when on orders tab
  useEffect(() => {
    if (active === 'orders') {
      ordersInterval.current = setInterval(() => loadOrders(orderFilter), 10000)
    } else {
      if (ordersInterval.current) { clearInterval(ordersInterval.current); ordersInterval.current = null }
    }
    return () => { if (ordersInterval.current) clearInterval(ordersInterval.current) }
  }, [active, loadOrders, orderFilter])

  // change order status
  async function handleChangeStatus(orderId, status) {
    try {
      await adminUpdateOrderStatus(orderId, status)
      await loadOrders(orderFilter)
    } catch (e) { /* error inline handled */ }
  }

  async function handleAddProduct(e) {
    e.preventDefault()
    try {
      await addProduct({ name: addData.name, image: addData.image, price: Number(addData.price), stock: Number(addData.stock), note: addData.note })
      setAddData({ name: '', image: '', price: '', stock: '', note: '' })
      setShowAdd(false)
      await loadProducts()
    } catch (err) { /* handle inline */ }
  }

  async function handleEditSave(id) {
    try {
      await updateProduct(id, { name: editingData.name, image: editingData.image, price: Number(editingData.price), stock: Number(editingData.stock), note: editingData.note })
      setEditingId(null)
      setEditingData({})
      await loadProducts()
    } catch (err) { /* ignore inline */ }
  }

  async function handleDelete(id) {
    if (!confirm('Delete product?')) return
    try { await deleteProduct(id); await loadProducts() } catch (e) {}
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-900 text-white p-4 fixed h-full">
        <div className="text-2xl font-bold mb-6">Suguna</div>
        <nav className="flex flex-col gap-2">
          {[
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'orders', label: 'Orders' },
            { key: 'products', label: 'Products' },
            { key: 'customers', label: 'Customers' },
          ].map(item => (
            <button key={item.key} onClick={() => setActive(item.key)} className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded ${active===item.key ? 'bg-gray-800' : 'hover:bg-gray-800'}`}>
              <Icon name={item.key} /> <span>{item.label}</span>
            </button>
          ))}

          <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/login' }} className="mt-4 flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800">
            <LogOut size={16} /> Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 ml-64 p-6 bg-gray-50">
        {active === 'dashboard' && (
          <div>
            <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
            {dashLoading ? <div>Loading...</div> : dashError ? <div className="text-red-600">{dashError}</div> : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded shadow"> <div className="text-sm text-gray-500">Today's Orders</div> <div className="text-2xl font-bold">{dash?.todays_orders ?? '-'}</div> </div>
                  <div className="bg-white p-4 rounded shadow"> <div className="text-sm text-gray-500">Today's Revenue</div> <div className="text-2xl font-bold">₹{dash?.todays_revenue ?? '0'}</div> </div>
                  <div className="bg-white p-4 rounded shadow"> <div className="text-sm text-gray-500">Weekly Revenue</div> <div className="text-2xl font-bold">₹{dash?.weekly_revenue ?? '0'}</div> </div>
                  <div className="bg-white p-4 rounded shadow"> <div className="text-sm text-gray-500">Monthly Revenue</div> <div className="text-2xl font-bold">₹{dash?.monthly_revenue ?? '0'}</div> </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-lg font-medium">This week vs Last week</div>
                      <div className="flex items-center gap-2 text-sm">
                        {dash?.weekly_percent_change >= 0 ? <ArrowUp className="text-green-600" /> : <ArrowDown className="text-red-600" />}
                        <div className={`${dash?.weekly_percent_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>{Math.abs(dash?.weekly_percent_change ?? 0)}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded shadow">
                    <div className="text-lg font-medium mb-2">Top 5 Products</div>
                    <ol className="list-decimal pl-5 text-sm">
                      {(dash?.top_products || []).slice(0,5).map((p, i) => <li key={i} className="py-1">{p.name} <span className="text-gray-500">({p.count})</span></li>)}
                    </ol>
                  </div>
                </div>

                <div className="mt-6 bg-white p-4 rounded shadow">
                  <div className="text-lg font-medium mb-2 text-red-600">Low Stock Alerts</div>
                  <ul className="text-sm">
                    {(dash?.low_stock || []).map((p, i) => <li key={i} className="py-1 text-red-700">{p.name} — {p.stock}</li>)}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}

        {active === 'orders' && (
          <div>
            <h1 className="text-2xl font-semibold mb-4">Orders</h1>
            <div className="flex gap-2 mb-4">
              {['', 'pending', 'confirmed', 'out_for_delivery', 'delivered'].map(s => (
                <button key={s} onClick={() => { setOrderFilter(s); loadOrders(s) }} className={`px-3 py-1 rounded ${orderFilter===s ? 'bg-indigo-600 text-white' : 'bg-white'}`}>{s === '' ? 'All' : s.replace(/_/g, ' ')}</button>
              ))}
            </div>

            {ordersLoading ? <div>Loading...</div> : ordersError ? <div className="text-red-600">{ordersError}</div> : (
              <div className="overflow-auto">
                <table className="w-full text-sm bg-white rounded">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="p-2">Order ID</th>
                      <th className="p-2">Customer</th>
                      <th className="p-2">Items</th>
                      <th className="p-2">Total</th>
                      <th className="p-2">Date</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id} className="border-b">
                        <td className="p-2">{String(o.id).slice(-8)}</td>
                        <td className="p-2">{o.delivery_address?.full_name || '—'}</td>
                        <td className="p-2">{(o.items||[]).map(it => `${it.name} x${it.quantity}`).join(', ')}</td>
                        <td className="p-2">₹{Number(o.total_amount).toFixed(2)}</td>
                        <td className="p-2">{new Date(o.created_at).toLocaleString()}</td>
                        <td className="p-2"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{o.status}</span></td>
                        <td className="p-2">
                          <select defaultValue={o.status} onChange={(e) => handleChangeStatus(o.id, e.target.value)} className="border rounded px-2 py-1 text-sm">
                            <option value="confirmed">confirmed</option>
                            <option value="out_for_delivery">out_for_delivery</option>
                            <option value="delivered">delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {active === 'products' && (
          <div>
            <h1 className="text-2xl font-semibold mb-4">Products</h1>
            <div className="mb-4 flex justify-between">
              <div />
              <div>
                <button onClick={() => setShowAdd(s => !s)} className="bg-indigo-600 text-white px-3 py-1 rounded">{showAdd ? 'Cancel' : 'Add Product'}</button>
              </div>
            </div>

            {showAdd && (
              <form onSubmit={handleAddProduct} className="bg-white p-4 rounded mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input required placeholder="Name" value={addData.name} onChange={e => setAddData({...addData, name: e.target.value})} className="border p-2" />
                  <input placeholder="Image URL" value={addData.image} onChange={e => setAddData({...addData, image: e.target.value})} className="border p-2" />
                  <input required placeholder="Price" value={addData.price} onChange={e => setAddData({...addData, price: e.target.value})} className="border p-2" />
                  <input required placeholder="Stock" value={addData.stock} onChange={e => setAddData({...addData, stock: e.target.value})} className="border p-2" />
                  <input placeholder="Note" value={addData.note} onChange={e => setAddData({...addData, note: e.target.value})} className="border p-2 md:col-span-2" />
                  <div className="md:col-span-3 text-right"><button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">Save</button></div>
                </div>
              </form>
            )}

            {productsLoading ? <div>Loading...</div> : productsError ? <div className="text-red-600">{productsError}</div> : (
              <div className="overflow-auto bg-white rounded shadow">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="p-2">Image</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Price</th>
                      <th className="p-2">Stock</th>
                      <th className="p-2">Available</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-b">
                        <td className="p-2"><img src={p.image} alt="" className="w-12 h-12 object-cover" /></td>
                        <td className="p-2">{editingId === p.id ? <input value={editingData.name} onChange={e => setEditingData({...editingData, name: e.target.value})} className="border p-1" /> : p.name}</td>
                        <td className="p-2">{editingId === p.id ? <input value={editingData.price} onChange={e => setEditingData({...editingData, price: e.target.value})} className="border p-1 w-24" /> : `₹${p.price}`}</td>
                        <td className="p-2">{editingId === p.id ? <input value={editingData.stock} onChange={e => setEditingData({...editingData, stock: e.target.value})} className="border p-1 w-20" /> : p.stock}</td>
                        <td className="p-2"><input type="checkbox" checked={p.available ?? true} onChange={async (e) => { await updateProduct(p.id, { available: e.target.checked }); await loadProducts() }} /></td>
                        <td className="p-2">
                          {editingId === p.id ? (
                            <>
                              <button onClick={() => handleEditSave(p.id)} className="bg-green-600 text-white px-2 py-1 rounded mr-2">Save</button>
                              <button onClick={() => { setEditingId(null); setEditingData({}) }} className="px-2 py-1">Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => { setEditingId(p.id); setEditingData({ name: p.name, image: p.image, price: p.price, stock: p.stock, note: p.note }) }} className="px-2 py-1 mr-2">Edit</button>
                              <button onClick={() => handleDelete(p.id)} className="px-2 py-1 text-red-600">Delete</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {active === 'customers' && (
          <div>
            <h1 className="text-2xl font-semibold mb-4">Customers</h1>
            {customersLoading ? <div>Loading...</div> : customersError ? <div className="text-red-600">{customersError}</div> : (
              <div className="bg-white rounded shadow overflow-auto">
                <table className="w-full text-sm">
                  <thead className="border-b"><tr><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Phone</th><th className="p-2">Total Orders</th><th className="p-2">Total Spent</th></tr></thead>
                  <tbody>
                    {customers.map(c => (
                      <tr key={c.id} className="border-b">
                        <td className="p-2">{c.name}</td>
                        <td className="p-2">{c.email}</td>
                        <td className="p-2">{c.phone}</td>
                        <td className="p-2">{c.total_orders || 0}</td>
                        <td className="p-2">₹{Number(c.total_spent || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
