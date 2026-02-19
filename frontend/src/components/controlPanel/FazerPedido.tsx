import { useEffect, useState } from 'react';
import { ServiceItem } from '../jobs/ServiceItem';
import api from '../../services/api';

interface ServiceListProps {
    categoria?: 'fisico' | 'online';
    limite?: number;
}

export const FazerPedido = ({ categoria = 'online' }: ServiceListProps) => {
    const [mostrarLegenda, setMostrarLegenda] = useState(false);

    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        api.get('/jobs').then((res: any) => setJobs(res.data));
    }, []);

    const jobsFiltrados = jobs.filter((job: any) => job.genero === categoria);

    return (
        <div>
            <div className="my-5 flex flex-col items-center justify-center">
                <h3 className="mb-2.5 text-orange-combat font-semibold text-[18px] ">Fazer um pedido</h3>
            </div>
            <div className="flex justify-end">
                <button onClick={() => setMostrarLegenda(!mostrarLegenda)} className="cursor-pointer bg-orange-combat/30 text-white/50 py-1 px-4 hover:bg-orange-combat hover:text-white text-xs transition-all border border-orange-combat/10">Finalizou um pedido?</button>
            </div>
            <div className={`finalizouPedido ${mostrarLegenda ? 'active' : ''} mb-6 p-4 bg-orange-combat/10 hover:bg-orange-combat/30 border-l-4 text-orange-combat w-full flex-col`}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1">📦 Ao finalizar um pedido:</p>
                    <p className="text-[11px] leading-relaxed text-white/90">* Vá até a área de <span className="font-semibold">'Meus Pedidos'</span> e realize o pagamento para que o pedido seja processado.</p>
                    <p className="text-[11px] leading-relaxed text-white/90">* Pedidos pagos ficam pendentes, basta aguardar o atendimento.</p>
                    <p className="text-[11px] leading-relaxed text-white/90">* Todos os serviços aqui prestados ficam disponíveis para download por 90 dias.</p>
            </div>

            <div>
                {jobsFiltrados.map((job: any) => (
                    <ServiceItem key={job.id} job={job} />
                ))}
            </div>
        </div>
    )
}