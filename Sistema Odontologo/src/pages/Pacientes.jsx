import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { fetchData } from '../controllers/apiService';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPaciente, setCurrentPaciente] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '', apellido: '', dni_nie: '', telefono: '', email: '', direccion: ''
  });

  const fetchPacientes = async () => {
    setLoading(true);
    try {
      const data = await fetchData('pacientes.php');
      setPacientes(Array.isArray(data) ? data : []);
    } catch (e) {
      Swal.fire('Error', 'No se pudieron cargar los pacientes', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  const handleInputChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentPaciente) {
        await fetchData(`pacientes.php?id=${currentPaciente.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        Swal.fire({ title: 'Actualizado!', text: 'Paciente actualizado correctamente', icon: 'success', timer: 1500, showConfirmButton: false });
      } else {
        await fetchData('pacientes.php', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        Swal.fire({ title: 'Creado!', text: 'Paciente registrado correctamente', icon: 'success', timer: 1500, showConfirmButton: false });
      }
      setIsModalOpen(false);
      fetchPacientes();
    } catch (e) {
      Swal.fire('Error', e.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await fetchData(`pacientes.php?id=${id}`, { method: 'DELETE' });
        Swal.fire('Eliminado!', 'El paciente ha sido eliminado.', 'success');
        fetchPacientes();
      } catch (e) {
        Swal.fire('Error', e.message, 'error');
      }
    }
  };

  const openModal = (paciente = null) => {
    if (paciente) {
      setCurrentPaciente(paciente);
      setFormData(paciente);
    } else {
      setCurrentPaciente(null);
      setFormData({ nombre: '', apellido: '', dni_nie: '', telefono: '', email: '', direccion: '' });
    }
    setIsModalOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Gestión de Pacientes</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={16} /> Nuevo Paciente
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <p>Cargando pacientes...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>DNI/NIE</th>
                <th>Nombre Completo</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map(p => (
                <tr key={p.id}>
                  <td>{p.dni_nie}</td>
                  <td>{p.nombre} {p.apellido}</td>
                  <td>{p.telefono}</td>
                  <td>{p.email}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openModal(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)' }}>
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-color)' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pacientes.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>No hay pacientes registrados.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '20px' }}>{currentPaciente ? 'Editar Paciente' : 'Nuevo Paciente'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input required className="input-field" name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Nombre" />
              <input required className="input-field" name="apellido" value={formData.apellido} onChange={handleInputChange} placeholder="Apellido" />
              <input required className="input-field" name="dni_nie" value={formData.dni_nie} onChange={handleInputChange} placeholder="DNI o NIE" />
              <input className="input-field" name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="Teléfono" />
              <input type="email" className="input-field" name="email" value={formData.email} onChange={handleInputChange} placeholder="Correo Electrónico" />
              <input className="input-field" name="direccion" value={formData.direccion} onChange={handleInputChange} placeholder="Dirección" />
              
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

export default Pacientes;
