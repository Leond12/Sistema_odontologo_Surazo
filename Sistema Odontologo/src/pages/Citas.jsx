import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { fetchData } from '../controllers/apiService';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

const Citas = () => {
  const [citas, setCitas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    paciente_id: '', fecha_hora: '', motivo: '', estado: 'pendiente'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [citasData, pacientesData] = await Promise.all([
        fetchData('citas.php'),
        fetchData('pacientes.php')
      ]);
      setCitas(Array.isArray(citasData) ? citasData : []);
      setPacientes(Array.isArray(pacientesData) ? pacientesData : []);
    } catch (e) {
      Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleInputChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await fetchData('citas.php', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      Swal.fire({ title: 'Agendada!', text: 'Cita guardada correctamente', icon: 'success', timer: 1500, showConfirmButton: false });
      setIsModalOpen(false);
      loadData();
    } catch (e) {
      Swal.fire('Error', e.message, 'error');
    }
  };

  const updateEstado = async (cita, nuevoEstado) => {
    try {
      await fetchData(`citas.php?id=${cita.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...cita, estado: nuevoEstado })
      });
      Swal.fire({ title: 'Actualizado!', text: `Estado cambiado a ${nuevoEstado}`, icon: 'success', timer: 1000, showConfirmButton: false });
      loadData();
    } catch (e) {
      Swal.fire('Error', e.message, 'error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Agenda de Citas</h2>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Nueva Cita
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <p>Cargando citas...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Paciente</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {citas.map(c => (
                <tr key={c.id}>
                  <td>{new Date(c.fecha_hora).toLocaleString()}</td>
                  <td>{c.nombre} {c.apellido}</td>
                  <td>{c.motivo}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold',
                      backgroundColor: c.estado === 'completada' ? 'var(--success-color)' : c.estado === 'cancelada' ? 'var(--danger-color)' : 'var(--warning-color)',
                      color: 'white'
                    }}>
                      {c.estado.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {c.estado === 'pendiente' && (
                        <>
                          <button onClick={() => updateEstado(c, 'completada')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--success-color)' }} title="Marcar completada">
                            <CheckCircle size={18} />
                          </button>
                          <button onClick={() => updateEstado(c, 'cancelada')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-color)' }} title="Cancelar">
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {citas.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>No hay citas registradas.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '20px' }}>Agendar Nueva Cita</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <select required className="input-field" name="paciente_id" value={formData.paciente_id} onChange={handleInputChange}>
                <option value="">Seleccione un paciente</option>
                {pacientes.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} {p.apellido} - {p.dni_nie}</option>
                ))}
              </select>
              <input required type="datetime-local" className="input-field" name="fecha_hora" value={formData.fecha_hora} onChange={handleInputChange} />
              <input required className="input-field" name="motivo" value={formData.motivo} onChange={handleInputChange} placeholder="Motivo de la consulta" />
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)} style={{ backgroundColor: 'var(--border-color)' }}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Citas;
