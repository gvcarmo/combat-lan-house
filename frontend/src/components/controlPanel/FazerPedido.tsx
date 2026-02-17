import { useEffect, useState } from 'react';
import { ServiceItem } from '../jobs/ServiceItem';
import api from '../../services/api';

interface ServiceListProps {
    categoria?: 'fisico' | 'online';
    limite?: number;
}

export const FazerPedido = ({ categoria = 'online' }: ServiceListProps) => {
    
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
            <div>
                {jobsFiltrados.map((job: any) => (
                    <ServiceItem key={job.id} job={job} />
                ))}
            </div>
        </div>
    )
}