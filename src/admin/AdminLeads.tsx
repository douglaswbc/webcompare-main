import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AdminLeads: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeads = async () => {
      const { data } = await supabase
        .from('leads')
        .select('*, plans ( name )')
        .order('created_at', { ascending: false });
      if (data) setLeads(data);
    };
    fetchLeads();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Leads Recentes</h2>
      
      {/* Wrapper com overflow-x-auto para responsividade */}
      <div className="bg-[#192633] rounded-xl border border-white/10 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400 min-w-[800px]">
            <thead className="bg-[#0d141c] text-white uppercase">
                <tr>
                <th className="p-4">Data</th>
                <th className="p-4">Nome</th>
                <th className="p-4">Contato</th>
                <th className="p-4">Interesse</th>
                <th className="p-4">Endereço</th>
                </tr>
            </thead>
            <tbody>
                {leads.map(lead => (
                <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">{new Date(lead.created_at).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-white">{lead.name}</td>
                    <td className="p-4">
                        <div className="text-white">{lead.phone}</div>
                        <div className="text-xs opacity-70">{lead.cpf}</div>
                    </td>
                    <td className="p-4 text-[#0096C7] font-medium">{lead.plans?.name}</td>
                    <td className="p-4 max-w-xs truncate text-xs" title={JSON.stringify(lead.address_json)}>
                        {lead.address_json?.logradouro ? `${lead.address_json.logradouro}, ${lead.address_json.bairro}` : 'N/A'}
                    </td>
                </tr>
                ))}
                {leads.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">Nenhum lead encontrado ainda.</td></tr>}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default AdminLeads;