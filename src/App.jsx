import React, { useEffect, useState } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  FileText,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import ModalForm from './ModalForm';

/* ================= SUPABASE ================= */

const SUPABASE_URL = 'https://bzycknurunbdehwcjhdu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6eWNrbnVydW5iZGVod2NqaGR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTQyNzQsImV4cCI6MjA4NTc5MDI3NH0.-BBiUFFM1oy9CBzvFV2OnV9YZyb9YVz88ARN9ZjwEys';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ================= APP ================= */

export default function App() {
  const [activeTab, setActiveTab] = useState('alumnos');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({});
  const [formConfig, setFormConfig] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);

    let result;

    switch (activeTab) {
      case 'alumnos':
        result = await supabase
          .from('alumnos')
          .select('id, nombre, apellido, matricula, id_carrera, carrera(nombre)');
        break;

      case 'carreras':
        result = await supabase.from('carrera').select('*');
        break;

      case 'materia':
        result = await supabase.from('materia').select('*');
        break;

      case 'kardex':
        result = await supabase.from('vista_kardex').select('*');
        break;

      case 'reportes':
        result = await supabase.from('vista_promedios').select('*');
        break;

      default:
        setLoading(false);
        return;
    }

    setData(result.data || []);
    setLoading(false);
  };

  /* ================= MODAL ================= */

  const openModal = (table, item = null) => {
    setEditingItem(item);

    if (item) {
      const clean = { ...item };
      delete clean.carrera;
      setForm(clean);
    } else {
      setForm({});
    }

    const configs = {
      alumnos: {
        title: item ? 'Editar Alumno' : 'Nuevo Alumno',
        table: 'alumnos',
        fields: [
          { name: 'nombre', label: 'Nombre' },
          { name: 'apellido', label: 'Apellido' },
          { name: 'matricula', label: 'Matrícula' },
          { name: 'fecha_nacimiento', label: 'Fecha Nacimiento', type: 'date' },
          { name: 'id_carrera', label: 'ID Carrera' }
        ]
      },
      carreras: {
        title: item ? 'Editar Carrera' : 'Nueva Carrera',
        table: 'carrera',
        fields: [
          { name: 'nombre', label: 'Nombre' },
          { name: 'duracion_anios', label: 'Duración (años)' }
        ]
      },
      materia: {
        title: item ? 'Editar Materia' : 'Nueva Materia',
        table: 'materia',
        fields: [
          { name: 'nombre', label: 'Nombre' },
          { name: 'semestre', label: 'Semestre' }
        ]
      }
    };

    setFormConfig(configs[table]);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (editingItem) {
      await supabase
        .from(formConfig.table)
        .update(form)
        .eq('id', editingItem.id);
    } else {
      await supabase.from(formConfig.table).insert(form);
    }

    setIsModalOpen(false);
    setEditingItem(null);
    fetchData();
  };

  const handleDelete = async (id, table) => {
    if (!confirm('¿Eliminar este registro?')) return;
    await supabase.from(table).delete().eq('id', id);
    fetchData();
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-slate-900 text-white p-6">
        <Nav label="Alumnos" icon={<Users />} onClick={() => setActiveTab('alumnos')} />
        <Nav label="Carreras" icon={<GraduationCap />} onClick={() => setActiveTab('carreras')} />
        <Nav label="Materias" icon={<BookOpen />} onClick={() => setActiveTab('materia')} />
        <Nav label="Kardex" icon={<FileText />} onClick={() => setActiveTab('kardex')} />
        <Nav label="Reportes" icon={<BarChart3 />} onClick={() => setActiveTab('reportes')} />
      </aside>

      <main className="flex-1 p-10">
        <header className="flex justify-between mb-6">
          <h2 className="text-2xl font-bold capitalize">{activeTab}</h2>
          {['alumnos', 'carreras', 'materia'].includes(activeTab) && (
            <button
              onClick={() => openModal(activeTab)}
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <Plus /> Nuevo
            </button>
          )}
        </header>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <table className="w-full bg-white rounded shadow">
            <tbody>

              {activeTab === 'alumnos' && data.map(a => (
                <tr key={a.id}>
                  <td className="p-3 border">{a.nombre}</td>
                  <td className="p-3 border">{a.apellido}</td>
                  <td className="p-3 border">{a.matricula}</td>
                  <td className="p-3 border">{a.carrera?.nombre ?? '—'}</td>
                  <td className="p-3 border flex gap-2">
                    <Edit2 onClick={() => openModal('alumnos', a)} />
                    <Trash2 onClick={() => handleDelete(a.id, 'alumnos')} />
                  </td>
                </tr>
              ))}

              {activeTab === 'carreras' && data.map(c => (
                <tr key={c.id}>
                  <td className="p-3 border">{c.nombre}</td>
                  <td className="p-3 border">{c.duracion_anios}</td>
                  <td className="p-3 border flex gap-2">
                    <Edit2 onClick={() => openModal('carreras', c)} />
                    <Trash2 onClick={() => handleDelete(c.id, 'carrera')} />
                  </td>
                </tr>
              ))}

              {activeTab === 'materia' && data.map(m => (
                <tr key={m.id}>
                  <td className="p-3 border">{m.nombre}</td>
                  <td className="p-3 border">{m.semestre}</td>
                  <td className="p-3 border flex gap-2">
                    <Edit2 onClick={() => openModal('materia', m)} />
                    <Trash2 onClick={() => handleDelete(m.id, 'materia')} />
                  </td>
                </tr>
              ))}

              {activeTab === 'kardex' && data.map((k, i) => (
                <tr key={i}>
                  <td className="p-3 border">{k.matricula}</td>
                  <td className="p-3 border">{k.alumno}</td>
                  <td className="p-3 border">{k.carrera}</td>
                  <td className="p-3 border">{k.materia}</td>
                  <td className="p-3 border">{k.calificacion}</td>
                  <td className="p-3 border">{k.periodo}</td>
                </tr>
              ))}

              {activeTab === 'reportes' && data.map(r => (
                <tr key={r.id}>
                  <td className="p-3 border">{r.nombre} {r.apellido}</td>
                  <td className="p-3 border">{Number(r.promedio).toFixed(2)}</td>
                  <td className="p-3 border">
                    {r.promedio >= 8 ? 'APROBADO' : 'RIESGO'}
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        )}
      </main>

      {isModalOpen && formConfig && (
        <ModalForm
          title={formConfig.title}
          fields={formConfig.fields}
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

/* ================= NAV ================= */

const Nav = ({ label, icon, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 mb-4 text-slate-300 hover:text-white w-full"
  >
    {icon}
    {label}
    <ChevronRight className="ml-auto" />
  </button>
);
