import { X, Save } from 'lucide-react';

export default function ModalForm({
  title,
  fields,
  form,
  setForm,
  onSave,
  onClose
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={onSave}
        className="bg-white rounded-xl w-full max-w-md p-6 space-y-4"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">{title}</h3>
          <button type="button" onClick={onClose}>
            <X />
          </button>
        </div>

        {fields.map((field) => (
          <div key={field.name}>
            <label className="text-sm font-medium">
              {field.label}
            </label>
            <input
              type={field.type || 'text'}
              value={form[field.name] || ''}
              onChange={(e) =>
                setForm({ ...form, [field.name]: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
        ))}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2"
          >
            <Save size={16} />
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
