import React, { useEffect, useState } from 'react';
import { Users, Calendar, DollarSign, Activity } from 'lucide-react';
import { fetchData } from '../controllers/apiService';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="card" 
    style={{ display: 'flex', alignItems: 'center', gap: '20px' }}
  >
    <div style={{ backgroundColor: `${color}20`, color: color, padding: '16px', borderRadius: '12px' }}>
      <Icon size={32} />
    </div>
    <div>
      <h3 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>{title}</h3>
      <p style={{ color: 'var(--text-primary)', fontSize: '28px', fontWeight: 'bold' }}>{value}</p>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    pacientes: 0,
    citasHoy: 0,
    ingresosMes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate real fetch since we don't have a dashboard endpoint yet
    // In a real scenario we'd call fetchData('dashboard.php')
    Promise.all([
      fetchData('pacientes.php').catch(() => []),
      fetchData('citas.php').catch(() => []),
      fetchData('facturas.php').catch(() => [])
    ]).then(([pacientes, citas, facturas]) => {
      const pacientesArr = Array.isArray(pacientes) ? pacientes : [];
      const citasArr = Array.isArray(citas) ? citas : [];
      const facturasArr = Array.isArray(facturas) ? facturas : [];

      const today = new Date().toISOString().split('T')[0];
      const citasHoy = citasArr.filter(c => c.fecha_hora && c.fecha_hora.startsWith(today)).length;
      
      const mesActual = new Date().getMonth();
      const ingresosMes = facturasArr
        .filter(f => f.estado_pago === 'pagado' && f.fecha_emision && new Date(f.fecha_emision).getMonth() === mesActual)
        .reduce((sum, f) => sum + parseFloat(f.total || 0), 0);

      setStats({
        pacientes: pacientesArr.length,
        citasHoy,
        ingresosMes
      });
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div style={{display:'flex', justifyContent:'center', marginTop:'50px'}}>Cargando...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '24px', fontSize: '28px' }}>Panel Principal</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        <StatCard 
          title="Total Pacientes" 
          value={stats.pacientes} 
          icon={Users} 
          color="#0ea5e9" 
          delay={0.1} 
        />
        <StatCard 
          title="Citas para Hoy" 
          value={stats.citasHoy} 
          icon={Calendar} 
          color="#f59e0b" 
          delay={0.2} 
        />
        <StatCard 
          title="Ingresos del Mes" 
          value={`$${stats.ingresosMes.toFixed(2)}`} 
          icon={DollarSign} 
          color="#10b981" 
          delay={0.3} 
        />
        <StatCard 
          title="Actividad" 
          value="Normal" 
          icon={Activity} 
          color="#8b5cf6" 
          delay={0.4} 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="card" 
        style={{ marginTop: '32px' }}
      >
        <h2 style={{ marginBottom: '16px' }}>Citas Próximas</h2>
        <div className="table-container">
          <p style={{color: 'var(--text-secondary)'}}>No hay citas próximas para mostrar hoy.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
