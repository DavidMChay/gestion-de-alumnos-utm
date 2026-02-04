import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  FileText,
  BarChart3,
  ChevronRight,
  Save,
  X
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

/* ================= SUPABASE ================= */

const SUPABASE_URL = 'https://bzycknurunbdehwcjhdu.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6eWNrbnVydW5iZGVod2NqaGR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTQyNzQsImV4cCI6MjA4NTc5MDI3NH0.-BBiUFFM1oy9CBzvFV2OnV9YZyb9YVz88ARN9ZjwEys';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ================= APP ================= */

export default function App() {
  const [activeTab, setActiveTab] = useState('alumnos');
  const [data, setData] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [alumnoForm, setAlumnoForm] = useState({
    nombre: '',
    apellido: '',
    matricula: '',
    fecha_nacimiento: '',
    id_carrera: ''
  });

  /* ================= DATA ================= */

  useEffect(() => {
    fetchData();
    fetchCarreras();
  }, [activeTab]);

  const fetchCarreras = async () => {
    const { data, error } = await supabase.from('carrera').select('*');
    if (!error) setCarreras(data);
  };

  const fetchData = async () => {
    setLoading(true);

    let query;

    switch (activeTab) {
      case 'alumnos':
        query = supabase.from('alumnos').select('*, carrera(nombre)');
        break;
      case 'carreras':
        query = supabase.from('carrera').select('*');
        break;
      case 'materia':
        query = supabase.from('materia').select('*, profesor(nombre)');
        break;
      case 'kardex':
        query = supabase.from('inscripcion').select(`
          periodo,
          alumnos(nombre, apellido, matricula, carrera(nombre)),
          materia(nombre),
          calificacion(calificacion)
        `);
        break;
      case 'reportes':
        query = supabase.from('alumnos').select(`
          nombre,
          apellido,
          inscripcion(calificacion(calificacion))
        `);
        break;
      default:
        setLoading(false);
        return;
    }

    const { data, error } = await query;
    if (!error) setData(data);
    setLoading(false);
  };

  /* ================= CRUD ================= */

  const handleSaveAlumno = async (e) => {
    e.preventDefault();

    if (editingItem) {
      await supabase.from('alumnos').update(alumnoForm).eq('id', editingItem.id);
    } else {
      await supabase.from('alumnos').insert(alumnoForm);
    }

    setIsModalOpen(false);
    setEditingItem(null);
    setAlumnoForm({
      nombre: '',
      apellido: '',
      matricula: '',
      fecha_nacimiento: '',
      id_carrera: ''
    });
    fetchData();
  };

  const deleteItem = async (id, table) => {
    if (!confirm('¿Eliminar este registro?')) return;
    await supabase.from(table).delete().eq('id', id);
    fetchData();
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen w-full flex bg-slate-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white p-6">
        <div className="flex items-center gap-3 mb-8">
          <GraduationCap className="text-blue-400 w-8 h-8" />
          <h1 className="text-xl font-bold">UTM Alumnos</h1>
        </div>

        <NavItem active={activeTab === 'alumnos'} onClick={() => setActiveTab('alumnos')} icon={<Users />} label="Alumnos" />
        <NavItem active={activeTab === 'carreras'} onClick={() => setActiveTab('carreras')} icon={<GraduationCap />} label="Carreras" />
        <NavItem active={activeTab === 'materia'} onClick={() => setActiveTab('materia')} icon={<BookOpen />} label="materia" />
        <div className="my-4 border-t border-slate-700" />
        <NavItem active={activeTab === 'kardex'} onClick={() => setActiveTab('kardex')} icon={<FileText />} label="Kardex" />
        <NavItem active={activeTab === 'reportes'} onClick={() => setActiveTab('reportes')} icon={<BarChart3 />} label="Reportes" />
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold capitalize">{activeTab}</h2>
          {activeTab === 'alumnos' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus /> Nuevo Alumno
            </button>
          )}
        </header>

        <div className="bg-white rounded-xl border overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center">Cargando...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50">{renderTableHeader(activeTab)}</thead>
              <tbody>
                {data.map((item, idx) =>
                  renderTableRow(activeTab, item, idx, setEditingItem, deleteItem)
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

/* ================= HELPERS ================= */

const NavItem = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
      }`}
  >
    {icon}
    <span>{label}</span>
    {active && <ChevronRight className="ml-auto" />}
  </button>
);


const renderTableHeader = (tab) => {
  const headers = {
    alumnos: ['Nombre', 'Matrícula', 'Fecha Nac.', 'Carrera', 'Acciones'],
    carreras: ['ID', 'Nombre', 'Duración', 'Acciones'],
    materia: ['Materia', 'Semestre', 'Profesor', 'Acciones'],
    kardex: ['Alumno', 'Matrícula', 'Materia', 'Periodo', 'Calificación'],
    reportes: ['Alumno', 'Promedio', 'Estado']
  };

  return (
    <tr>
      {headers[tab]?.map((h) => (
        <th
          key={h}
          className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500"
        >
          {h}
        </th>
      ))}
    </tr>
  );
};

const renderTableRow = (tab, item, idx, onEdit, onDelete) => {
  switch (tab) {
    case 'alumnos':
      return (
        <tr key={item.id} className="hover:bg-slate-50">
          <td className="px-6 py-4 font-medium">
            {item.nombre} {item.apellido}
          </td>
          <td className="px-6 py-4">{item.matricula}</td>
          <td className="px-6 py-4">{item.fecha_nacimiento}</td>
          <td className="px-6 py-4">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
              {item.carrera?.nombre || 'N/A'}
            </span>
          </td>
          <td className="px-6 py-4 flex gap-3">
            <button
              onClick={() => onEdit(item)}
              className="text-blue-600 hover:text-blue-800"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => onDelete(item.id, 'alumnos')}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 size={18} />
            </button>
          </td>
        </tr>
      );

    case 'carreras':
      return (
        <tr key={item.id}>
          <td className="px-6 py-4">{item.id}</td>
          <td className="px-6 py-4 font-bold">{item.nombre}</td>
          <td className="px-6 py-4">{item.duracion_anios} años</td>
          <td className="px-6 py-4 text-slate-400">—</td>
        </tr>
      );

    case 'kardex':
      return (
        <tr key={idx}>
          <td className="px-6 py-4">
            {item.alumnos?.nombre} {item.alumnos?.apellido}
          </td>
          <td className="px-6 py-4">{item.alumnos?.matricula}</td>
          <td className="px-6 py-4">{item.materia?.nombre}</td>
          <td className="px-6 py-4">{item.periodo}</td>
          <td className="px-6 py-4 font-bold">
            {item.calificacion?.[0]?.calificacion ?? 'Pte'}
          </td>
        </tr>
      );

    case 'reportes':
      const califs =
        item.inscripcion?.flatMap((i) =>
          i.calificacion?.map((c) => c.calificacion)
        ) || [];

      const promedio =
        califs.length > 0
          ? (califs.reduce((a, b) => a + b, 0) / califs.length).toFixed(2)
          : '0.00';

      return (
        <tr key={idx}>
          <td className="px-6 py-4">
            {item.nombre} {item.apellido}
          </td>
          <td className="px-6 py-4 font-bold">{promedio}</td>
          <td className="px-6 py-4">
            {promedio >= 8 ? (
              <span className="text-green-700 font-bold">APROBADO</span>
            ) : (
              <span className="text-orange-600 font-bold">RIESGO</span>
            )}
          </td>
        </tr>
      );

    case 'materia':
      return (
        <tr key={item.id} className="hover:bg-slate-50">
          <td className="px-6 py-4 font-medium">{item.nombre}</td>
          <td className="px-6 py-4">{item.semestre}</td>
          <td className="px-6 py-4">
            {item.profesor?.nombre || 'Sin profesor'}
          </td>
          <td className="px-6 py-4 flex gap-3">
            <button
              onClick={() => onEdit(item)}
              className="text-blue-600 hover:text-blue-800"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => onDelete(item.id, 'materia')}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 size={18} />
            </button>
          </td>
        </tr>
      );


    default:
      return null;
  }
};
