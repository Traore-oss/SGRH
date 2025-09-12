import type { LucideIcon } from 'lucide-react';
import React from 'react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface Action {
  icon: LucideIcon;
  label: string;
  onClick: (row: any) => void;
  color?: string;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  actions?: Action[];
  emptyMessage?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  actions,
  emptyMessage = 'Aucune donnée disponible',
}) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, idx) => (
              <tr key={row.id || idx} className="hover:bg-gray-50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                {actions && actions.length > 0 && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex justify-end space-x-2">
                      {actions.map((action, aidx) => (
                        <button
                          key={aidx}
                          onClick={() => action.onClick(row)}
                          className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${action.color || 'text-gray-600'}`}
                          title={action.label}
                        >
                          <action.icon className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data.map((row, idx) => (
          <div key={row.id || idx} className="bg-white rounded-lg shadow p-4 space-y-2 border border-gray-200">
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between">
                <span className="text-gray-500 font-medium text-sm">{col.label}</span>
                <span className="text-gray-900 text-sm">{col.render ? col.render(row[col.key], row) : row[col.key]}</span>
              </div>
            ))}
            {actions && actions.length > 0 && (
              <div className="flex justify-end space-x-2 mt-2">
                {actions.map((action, aidx) => (
                  <button
                    key={aidx}
                    onClick={() => action.onClick(row)}
                    className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${action.color || 'text-gray-600'}`}
                    title={action.label}
                  >
                    <action.icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
