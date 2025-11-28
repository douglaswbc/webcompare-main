import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../supabaseClient';

const AdminLeads: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeads = async () => {
      const { data } = await supabase
        .from('leads')
        .select(`
            *,
            plans ( name )
        `)
        .order('created_at', { ascending: false });
      if (data) setLeads(data);
    };
    fetchLeads();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Leads Recentes</h2>
      <div className="bg-[#192633] rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-[#0d141c] text-white uppercase">
            <tr>
              <th className="p-4">Data</th>
              <th className="p-4">Nome</th>
              <th className="p-4">Contato</th>
              <th className="p-4">Interesse</th>
              <th className="p-4">Endereço (JSON)</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4">{new Date(lead.created_at).toLocaleDateString()}</td>
                <td className="p-4 font-bold text-white">{lead.name}</td>
                <td className="p-4">
                    <div>{lead.phone}</div>
                    <div className="text-xs">{lead.cpf}</div>
                </td>
                <td className="p-4 text-primary">{lead.plans?.name}</td>
                <td className="p-4 max-w-xs truncate" title={JSON.stringify(lead.address_json)}>
                    {lead.address_json?.logradouro}, {lead.address_json?.bairro}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLeads;