import { AuthContext } from "../../contexts/AuthContext";
import { useContext, useEffect, useState } from "react";
import api from "../../services/api";
import { ServiceItem } from "./ServiceItem";

interface Job {
    id: number;
    nome: string;
    descricao: string;
    infos_uteis: string;
    icone: string;
    ordem: number;
}

export const Jobs = () => {

    const { isAdmin } = useContext(AuthContext);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');

    const [isSending, setIsSending] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");

    const [showList, setShowList] = useState<number>(5);

    const showMore = () => {
        setShowList((prev) => Math.min(prev + 5, jobs.length))
    }

    const showLess = () => {
        setShowList((prev) => Math.min(prev, prev = 5))
    }

    const filteredJobs = jobs.filter(job => {
        const search = searchTerm.toLowerCase();

        return (
            job.nome?.toLowerCase().includes(search) ||
            job.descricao?.toLowerCase().includes(search) ||
            job.infos_uteis?.toLowerCase().includes(search)
        );
    });

    const [newJob, setNewJob] = useState({
        icone: '',
        nome: '',
        descricao: '',
        infos_uteis: ''
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    }

    useEffect(() => {
        api.get('/jobs').then(res => setJobs(res.data));
    }, []);

    const fetchJobs = async () => {
        const res = await api.get('/jobs');
        setJobs(res.data);
    }

    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSending(true);

        const formData = new FormData();
        formData.append('nome', newJob.nome);
        formData.append('descricao', newJob.descricao);
        formData.append('infos_uteis', newJob.infos_uteis);
        if (file) formData.append('icone', file);

        try {
            const response = await api.post('/jobs', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.status === 201 || response.status === 200) {
                alert("Serviço cadastrado com sucesso!");

                setNewJob({ icone: '', nome: '', descricao: '', infos_uteis: '' });

                setFile(null);
                setPreview('');
                setShowAddForm(false);
                fetchJobs();
            }
        } catch (err) {
            alert("Erro no upload");
        } finally {
            setIsSending(false);
        }
    }

    return (
        <div className="flex justify-center mb-2.5 ">
            <div id="jobs" className="min-[1139px]:w-280 min-[610px]:w-139 min-[320px]:w-71 flex flex-col items-center py-2.5 bg-neutral-grayish border border-neutral-border-light-color text-white">
                <div className="w-full max-w-275 bg-neutral-dark-grayish border border-gray-800 p-6 max-[610px]:p-2">

                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <div className="relative flex-1 max-w-md">
                                <input className="py-2.5 pl-12 w-full bg-[#1a1a1a] border border-gray-700" placeholder="Pesquisar serviço..." type="text"
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

                            <div className="">
                                {searchTerm === "" ? (
                                    <p className="text-gray-500 text-center py-5">
                                        Digite algo para procurar um serviço...
                                    </p>
                                ) : filteredJobs.length > 0 ? (
                                    filteredJobs.map(job => (
                                        <ServiceItem key={job.id} job={job} isAdmin={isAdmin} />
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-10">
                                        Nenhum serviço encontrado para "{searchTerm}"
                                    </p>
                                )}
                            </div>
                        </div>

                        {isAdmin && (
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="ml-4 bg-orange-combat hover:bg-white hover:text-orange-combat transition-all px-6 py-2 font-bold"
                            >
                                {showAddForm ? "Fechar" : "+ Novo Serviço"}
                            </button>
                        )}
                    </div>

                    {showAddForm && (
                        <div className="mb-10 p-6 border border-orange-combat/50 bg-[#1a1a1a] shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
                            <h2 className="text-xl font-bold mb-6 text-orange-combat uppercase tracking-wider">
                                Novo Serviço
                            </h2>

                            <form onSubmit={handleCreateJob} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-400 ml-1">Nome do Serviço</label>
                                    <input
                                        required
                                        className="p-3 bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors"
                                        placeholder="Ex: Formatação de PC"
                                        value={newJob.nome}
                                        onChange={e => setNewJob({ ...newJob, nome: e.target.value })}
                                    />
                                </div>

                                <div className="flex flex-col gap-1 md:col-span-1">
                                    <label className="text-xs text-gray-400 ml-1 font-bold">Ícone do Serviço</label>
                                    <div className="flex items-center gap-4 p-3 bg-neutral-grayish border border-gray-700">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="cursor-pointer bg-orange-combat px-4 py-1 text-xs font-bold hover:bg-white hover:text-orange-combat transition-all"
                                        >
                                            ESCOLHER ARQUIVO
                                        </label>

                                        {preview && (
                                            <img src={preview} alt="Preview" className="w-10 h-10 object-contain border border-gray-600" />
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 md:col-span-2">
                                    <label className="text-xs text-gray-400 ml-1">Descrição</label>
                                    <textarea
                                        required
                                        rows={3}
                                        className="p-3 bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors resize-none"
                                        placeholder="Descreva o que está incluso no serviço..."
                                        value={newJob.descricao}
                                        onChange={e => setNewJob({ ...newJob, descricao: e.target.value })}
                                    />
                                </div>

                                <div className="flex flex-col gap-1 md:col-span-2">
                                    <label className="text-xs text-gray-400 ml-1">Informações Úteis (Opcional)</label>
                                    <input
                                        className="p-3 bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors"
                                        placeholder="Ex: Prazo de 24h, trazer pendrive, etc."
                                        value={newJob.infos_uteis}
                                        onChange={e => setNewJob({ ...newJob, infos_uteis: e.target.value })}
                                    />
                                </div>

                                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="px-6 py-2 border border-gray-600 hover:bg-gray-800 transition-all uppercase text-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        disabled={isSending}
                                        type="submit"
                                        className={`px-10 py-2 bg-orange-combat hover:bg-white hover:text-orange-combat font-bold transition-all uppercase text-sm ${isSending ? 'opacity-50' : ''}`}
                                    >
                                        {isSending ? 'Salvando...' : 'Salvar Serviço'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                        {jobs.slice(0, showList).map((job: any) => (
                            <ServiceItem key={job.id} job={job} isAdmin={!!isAdmin} onUpdate={fetchJobs} />
                        ))}
                        <div className="flex justify-center items-center gap-2 max-[610px]:gap-0">
                            <button
                                onClick={showMore}
                                className="cursor-pointer ml-4 max-[610px]:ml-0 bg-orange-combat hover:bg-white hover:text-orange-combat transition-all px-6 max-[610px]:px-2 py-2 font-semibold w-40"
                            >
                                Mostrar mais
                            </button>
                            <button
                                onClick={showLess}
                                className="cursor-pointer ml-4 max-[610px]:ml-2 bg-orange-combat hover:bg-white hover:text-orange-combat transition-all px-6 py-2 font-semibold w-40"
                            >
                                Recolher
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};