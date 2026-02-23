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
    genero: string;
    preco: string;
    desc: string;
    total: string;
}

export const Jobs = () => {

    const { isAdmin, setGlobalLoading, isLogged, user } = useContext(AuthContext);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');

    const [isSending, setIsSending] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");

    const [showList, setShowList] = useState<number>(5);

    const [filtroAtivo, setFiltroAtivo] = useState<'presencial' | 'online'>('presencial');

    const jobsFiltrados = jobs.filter((job: any) => {

        if (!job.genero) return false;

        return job.genero.toLowerCase() === filtroAtivo.toLowerCase();
    })

    const showMore = () => {
        setShowList((prev) => Math.min(prev + 5, jobs.length))
    }

    const showLess = () => {
        setShowList((prev) => Math.min(prev, prev = 5))
    }

    const filteredJobs = jobs.filter((job) => {
        const search = searchTerm.toLowerCase();

        const matchesCategory = job.genero?.toLowerCase() === filtroAtivo.toLowerCase();

        const matchesSearch =
            job.nome?.toLowerCase().includes(search) ||
            job.descricao?.toLowerCase().includes(search);

        return matchesCategory && matchesSearch;
    });

    const [newJob, setNewJob] = useState({
        icone: '',
        nome: '',
        descricao: '',
        infos_uteis: '',
        genero: '',
        preco: '',
        desc: '',
        total: '',
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
        formData.append('genero', newJob.genero);
        formData.append('preco', newJob.preco);
        formData.append('desc', newJob.desc);
        formData.append('total', newJob.total);
        if (file) formData.append('icone', file);

        setGlobalLoading(true);
        try {
            const response = await api.post('/jobs', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.status === 201 || response.status === 200) {
                alert("Serviço cadastrado com sucesso!");

                setNewJob({ icone: '', nome: '', descricao: '', infos_uteis: '', genero: '', preco: '', desc: '', total: '' });

                setFile(null);
                setPreview('');
                setShowAddForm(false);
                fetchJobs();
            }
        } catch (err) {
            alert("Erro no upload");
        } finally {
            setIsSending(false);
            setGlobalLoading(false);
        }
    }

    return (
        <div className="flex justify-center mb-2.5 ">
            <div id="jobs" className="min-[1139px]:w-280 min-[610px]:w-139 min-[320px]:w-71 flex flex-col items-center py-2.5 bg-neutral-grayish border border-neutral-border-light-color text-white">

                <div className="w-full max-w-275 bg-neutral-dark-grayish border border-gray-800 p-6 max-[610px]:p-2">

                    {isLogged && user ? (

                        <div className={`mb-6 p-4 bg-orange-combat/10 hover:bg-orange-combat/30 border-l-4 text-orange-combat w-full flex-col`}>
                            <p className="text-xs font-bold uppercase tracking-wider mb-1">📦 Antes de fazer um pedido:</p>
                            <p className="text-[11px] leading-relaxed text-white/90">* A categoria <span className="h-fit px-2 text-xs font-bold uppercase bg-orange-combat">'Presencial'</span> são os serviços exclusivos da loja presencial, você pode ir até a loja ou pedi-los via whatsapp <a className="text-blue-400 hover:text-blue-700" href="http://wa.me/+55349996368855" target="_blank">(Clique Aqui)</a>.</p>
                            <p className="text-[11px] leading-relaxed text-white/90">* O canal do <span className="font-semibold">'WhatsApp'</span> é EXCLUSIVO da loja <span className="font-semibold">'Presencial'</span> <a className="text-blue-400 hover:text-blue-700" href="http://wa.me/+55349996368855" target="_blank">(Clique Aqui)</a>.</p>
                            <p className="text-[11px] leading-relaxed text-white/90">* A categoria <span className="h-fit px-2 text-xs font-bold uppercase bg-orange-combat">'Online'</span> são serviços exclusivos da loja Online, você clica em pedir e aguarda o pedido no painel Meus Pedidos.</p>
                            <p className="text-[11px] leading-relaxed text-white/90">* Para qualquer comunicação com a loja online, abra um <b>Ticket</b>.</p>
                        </div>
                    ) : ('')}

                    <div className="flex justify-between items-center w-full">
                        <div className="border-l-4 border-orange-combat bg-orange-combat/10 py-2 pl-4 flex flex-col gap-1 md:col-span-2 mb-4 w-full">
                            <div className="text-xs uppercase mb-1">

                                <div className="relative">
                                    <input className="px-8 py-1 mr-2 text-sm bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors resize-none w-[98%]" placeholder="Pesquisar serviço..." type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)} />
                                    <img className="absolute w-4 top-2 left-2 opacity-50" src="./icons/search.svg" alt="Procurar" />
                                </div>

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
                                        Antes de digitar algo, selecione um filtro abaixo...
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


                        {isAdmin && (
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="cursor-pointer ml-4 bg-orange-combat hover:bg-white hover:text-orange-combat transition-all px-2 w-50 py-2 font-bold"
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
                                    <label className="text-xs text-gray-400 ml-1">Nome do Serviço: *</label>
                                    <input
                                        required
                                        className="p-3 bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors"
                                        placeholder="Ex: Formatação de PC"
                                        value={newJob.nome}
                                        onChange={e => setNewJob({ ...newJob, nome: e.target.value })}
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-400 ml-1">Gênero do Serviço: *</label>
                                    <select
                                        required
                                        className="p-3 bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors resize-none"
                                        value={newJob.genero}
                                        onChange={e => setNewJob({ ...newJob, genero: e.target.value })}
                                    >
                                        <option value="">Selecione o gênero</option>
                                        <option value="presencial">Presencial</option>
                                        <option value="online">On-line</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1 md:col-span-1">
                                    <label className="text-xs text-gray-400 ml-1">Ícone:</label>
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
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-400 ml-1">Preço: </label>
                                    <input
                                        className="p-3 bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors"
                                        placeholder="Ex.: 2,00"
                                        value={`${newJob.preco}`}
                                        onChange={e => setNewJob({ ...newJob, preco: e.target.value })}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-400 ml-1">Desconto:</label>
                                    <input

                                        className="p-3 bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors"
                                        placeholder="Ex.: 0,50"
                                        value={`${newJob.desc}`}
                                        onChange={e => setNewJob({ ...newJob, desc: e.target.value })}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-400 ml-1">Total:</label>
                                    <input
                                        className="p-3 bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors"
                                        placeholder="Ex.: 1,50"
                                        value={`${newJob.total}`}
                                        onChange={e => setNewJob({ ...newJob, total: e.target.value })}
                                    />
                                </div>
                                <div className="flex flex-col gap-1 md:col-span-2">
                                    <label className="text-xs text-gray-400 ml-1">Descrição: *</label>
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
                                    <label className="text-xs text-gray-400 ml-1">Informações Úteis:</label>
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
                                        className={`cursor-pointer px-10 py-2 bg-orange-combat hover:bg-white hover:text-orange-combat font-bold transition-all uppercase text-sm ${isSending ? 'opacity-50' : ''}`}
                                    >
                                        {isSending ? 'Salvando...' : 'Salvar Serviço'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <div className="flex flex-col gap-4 justify-center mb-4">
                                <div className="flex flex-col gap-4">
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setFiltroAtivo('presencial')}
                                            className={`cursor-pointer hover:bg-white hover:text-orange-combat px-6 py-1 font-bold transition-all ${filtroAtivo === 'presencial' ? 'bg-orange-combat text-white' : 'bg-gray-700 text-gray-300'}`}
                                        >
                                            PRESENCIAL
                                        </button>
                                        <button
                                            onClick={() => setFiltroAtivo('online')}
                                            className={`cursor-pointer px-6 py-1 font-bold transition-all hover:bg-white hover:text-orange-combat ${filtroAtivo === 'online' ? 'bg-orange-combat text-white' : 'bg-gray-700 text-gray-300'}`}
                                        >
                                            ONLINE
                                        </button>
                                    </div>

                                </div>

                            </div>

                            {jobsFiltrados.slice(0, showList).map((job: any) => (
                                <ServiceItem key={job.id} job={job} onUpdate={fetchJobs} />
                            ))}

                        </div>
                        <div className="flex justify-center items-center gap-2 max-[610px]:gap-0">
                            <button
                                onClick={showMore}
                                className="cursor-pointer ml-4 max-[610px]:ml-0 bg-orange-combat hover:bg-white hover:text-orange-combat transition-all px-6 max-[610px]:px-2 py-2 font-semibold w-40"
                            >
                                Mostrar + 5
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