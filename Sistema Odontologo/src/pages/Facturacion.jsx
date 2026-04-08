import React, { useState, useEffect } from 'react';
import { FileText, Plus, DollarSign } from 'lucide-react';
import { fetchData } from '../controllers/apiService';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

const Facturacion = () => {
  const [facturas, setFacturas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    paciente_id: '',
    detalles: [{ descripcion: '', cantidad: 1, precio_unitario: 0 }],
    metodo_pago: 'efectivo',
    estado_pago: 'pagado'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [fData, pData] = await Promise.all([
        fetchData('facturas.php'),
        fetchData('pacientes.php')
      ]);
      setFacturas(Array.isArray(fData) ? fData : []);
      setPacientes(Array.isArray(pData) ? pData : []);
    } catch (e) {
      Swal.fire('Error', 'No se pudieron cargar las facturas', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleDetailChange = (index, field, value) => {
    const newDetalles = [...formData.detalles];
    newDetalles[index][field] = value;
    setFormData({ ...formData, detalles: newDetalles });
  };

  const addDetail = () => {
    setFormData({
      ...formData,
      detalles: [...formData.detalles, { descripcion: '', cantidad: 1, precio_unitario: 0 }]
    });
  };

  const removeDetail = (index) => {
    const newDetalles = formData.detalles.filter((_, i) => i !== index);
    setFormData({ ...formData, detalles: newDetalles });
  };

  const calculateTotal = () => {
    return formData.detalles.reduce((acc, det) => acc + (det.cantidad * det.precio_unitario), 0);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const total = calculateTotal();
    try {
      await fetchData('facturas.php', {
        method: 'POST',
        body: JSON.stringify({ ...formData, subtotal: total, total: total }) // Simplify taxes for MVP
      });
      Swal.fire({ title: 'Facturado!', text: 'Factura generada correctamente', icon: 'success', timer: 1500, showConfirmButton: false });
      setIsModalOpen(false);
      setFormData({ paciente_id: '', detalles: [{ descripcion: '', cantidad: 1, precio_unitario: 0 }], metodo_pago: 'efectivo', estado_pago: 'pagado' });
      loadData();
    } catch (e) {
      Swal.fire('Error', e.message, 'error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Facturación / Cobros</h2>
        <button className="btn btn-success" onClick={() => setIsModalOpen(true)} style={{ backgroundColor: 'var(--success-color)', color: 'white' }}>
          <DollarSign size={16} /> Emitir Factura
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <p>Cargando facturas...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nº Factura</th>
                <th>Fecha Emisión</th>
                <th>Paciente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Método</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map(f => (
                <tr key={f.id}>
                  <td>{f.numero_factura}</td>
                  <td>{new Date(f.fecha_emision).toLocaleDateString()}</td>
                  <td>{f.nombre} {f.apellido}</td>
                  <td style={{ fontWeight: 'bold' }}>${parseFloat(f.total).toFixed(2)}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold',
                      backgroundColor: f.estado_pago === 'pagado' ? 'var(--success-color)' : 'var(--warning-color)',
                      color: 'white'
                    }}>
                      {f.estado_pago.toUpperCase()}
                    </span>
                  </td>
                  <td>{f.metodo_pago ? f.metodo_pago.toUpperCase() : '-'}</td>
                </tr>
              ))}
              {facturas.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center' }}>No hay facturas emitidas.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card" style={{ width: '100%', maxWidth: '600px', margin: '40px 0' }}>
            <h3 style={{ marginBottom: '20px' }}>Emitir Nueva Factura / Cobro</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '14px', marginBottom: '4px', display: 'block', color: 'var(--text-secondary)' }}>Paciente</label>
                  <select required className="input-field" value={formData.paciente_id} onChange={e => setFormData({...formData, paciente_id: e.target.value})}>
                    <option value="">Seleccione paciente</option>
                    {pacientes.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '14px', marginBottom: '4px', display: 'block', color: 'var(--text-secondary)' }}>Método de Pago</label>
                  <select required className="input-field" value={formData.metodo_pago} onChange={e => setFormData({...formData, metodo_pago: e.target.value})}>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="qr">Pago QR</option>
                  </select>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', margin: '10px 0' }}></div>
              <h4 style={{ color: 'var(--text-secondary)' }}>Detalle de Servicios</h4>

              {formData.detalles.map((det, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <input required className="input-field" style={{ flexGrow: 1 }} placeholder="Descripción del servicio" value={det.descripcion} onChange={e => handleDetailChange(index, 'descripcion', e.target.value)} />
                  <input required type="number" min="1" className="input-field" style={{ width: '80px' }} placeholder="Cant." value={det.cantidad} onChange={e => handleDetailChange(index, 'cantidad', e.target.value)} />
                  <input required type="number" step="0.01" className="input-field" style={{ width: '100px' }} placeholder="Precio U." value={det.precio_unitario} onChange={e => handleDetailChange(index, 'precio_unitario', parseFloat(e.target.value))} />
                  {formData.detalles.length > 1 && (
                    <button type="button" onClick={() => removeDetail(index)} className="btn btn-danger" style={{ padding: '10px' }}>X</button>
                  )}
                </div>
              ))}

              <button type="button" className="btn" onClick={addDetail} style={{ alignSelf: 'flex-start', margin: '5px 0' }}>+ Agregar Ítem</button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', padding: '15px', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Total a cobrar:</span>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-color)' }}>${calculateTotal().toFixed(2)}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)} style={{ backgroundColor: 'var(--border-color)' }}>Cancelar</button>
                <button type="submit" className="btn" style={{ backgroundColor: 'var(--success-color)', color: 'white' }}>Registrar Cobro</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Facturacion;
