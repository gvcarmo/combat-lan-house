import { useEffect, useState } from 'react';
import { ServiceItem } from '../jobs/ServiceItem';
import api from '../../services/api';

interface Job {
    nome?: string;
    descricao?: string;
    categoria?: 'fisico' | 'online';
    genero?: string;
    limite?: number;
}

export const FazerPedido = ({ categoria = 'online' }: Job) => {
    const [searchTerm, setSearchTerm] = useState("");

    const [jobs, setJobs] = useState<Job[]>([]);

    useEffect(() => {
        api.get('/jobs').then((res: any) => setJobs(res.data));
    }, []);

    const filteredJobs = jobs.filter((job) => {
        const search = searchTerm.toLowerCase();

        const matchesCategory = job.genero === 'online';

        const matchesSearch =
            job.nome?.toLowerCase().includes(search) ||
            job.descricao?.toLowerCase().includes(search);

        return matchesCategory && matchesSearch;
    });


    const jobsFiltrados = jobs.filter((job: any) => job.genero === categoria);

    return (
        <div>
            <div className="my-5 flex flex-col items-center justify-center">
                <h3 className="mb-2.5 text-orange-combat font-semibold text-[18px] ">Fazer um pedido</h3>
            </div>
            
            <div className={`mb-6 p-4 bg-orange-combat/10 hover:bg-orange-combat/30 border-l-4 text-orange-combat w-full flex-col`}>
                <p className="text-xs font-bold uppercase tracking-wider mb-1">📦 Ao finalizar um pedido:</p>
                <p className="text-[11px] leading-relaxed text-white/90">* Vá até a área de <span className="font-semibold">'Meus Pedidos'</span> e realize o pagamento para que o pedido seja processado.</p>
                <p className="text-[11px] leading-relaxed text-white/90">* Pedidos pagos ficam pendentes, basta aguardar o atendimento.</p>
                <p className="text-[11px] leading-relaxed text-white/90">* Todos os serviços aqui prestados ficam disponíveis para download por 90 dias.</p>
            </div>

            <div className="border-l-4 border-orange-combat bg-orange-combat/10 py-2 pl-4 flex flex-col gap-1 md:col-span-2 mb-6">
                <div className="text-xs uppercase mb-1">
                    <input className="p-1 mr-2 text-sm bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors resize-none w-[98%]" placeholder="Pesquisar serviço..." type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)} />
                    <img className="absolute w-5 top-3 left-4 opacity-50" src="./icons/search.svg" alt="Procurar" />

                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-4 top-3 text-gray-500 hover:text-white"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="flex flex-col">
                    {searchTerm === "" ? (
                        <p className="p-1 mr-2 text-xs  focus:border-orange-combat outline-none transition-colors resize-none">
                            Digite algo para procurar um serviço...
                        </p>
                    ) : filteredJobs.length > 0 ? (
                        filteredJobs.map((job: any) => (
                            <ServiceItem key={job.id} job={job} />
                        ))
                    ) : (
                        <p className="p-1 mr-2 text-xs  focus:border-orange-combat outline-none transition-colors resize-none">
                            Nenhum serviço encontrado para "{searchTerm}"
                        </p>
                    )}
                </div>
            </div>

            <div>
                {jobsFiltrados.map((job: any) => (
                    <ServiceItem key={job.id} job={job} />
                ))}
            </div>
        </div>
    )
}