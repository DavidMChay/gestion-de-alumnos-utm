import React from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      
      {/* Card */}
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl animate-fade-in">
        <form onSubmit={onSave} className="flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800"
            >
              <X />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type || 'text'}
                  value={form[field.name] ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [field.name]: e.target.value
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
            >
              <Save size={16} />
              Guardar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
