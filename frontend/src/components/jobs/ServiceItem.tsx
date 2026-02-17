import { useContext, useState } from "react";
import api from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from 'react-router-dom';

interface JobProps {
    job: any;
    onUpdate?: any;
}

export const ServiceItem = ({ job, onUpdate }: JobProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ ...job });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>("");

    const { isAdmin, user, isLogged } = useContext(AuthContext);

    const { setGlobalLoading } = useContext(AuthContext);

    const navigate = useNavigate();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    }

    const handleUpdate = async () => {
        const formData = new FormData();

        formData.append('ordem', String(editData.ordem || 0));
        formData.append('nome', editData.nome || "");
        formData.append('descricao', editData.descricao || "");
        formData.append('infos_uteis', editData.infos_uteis || "");
        formData.append('genero', editData.genero || "");
        formData.append('preco', editData.preco || "");
        formData.append('desc', editData.desc || "");
        formData.append('total', editData.total || "");

        if (selectedFile) formData.append('icone', selectedFile);

        setGlobalLoading(true);
        try {
            await api.put(`/jobs/${job.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsEditing(false);
            setPreview(null);
            onUpdate();
            alert("Serviço atualizado!");
        } catch (err: any) {
            console.error("Erro na resposta da API:", err.response?.data || err.message);
            alert("Erro ao atualizar serviço.");
        } finally {
            setGlobalLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm(`Tem certeza que deseja excluir o serviço "${job.nome}"?`)) {

            setGlobalLoading(true);
            try {
                await api.delete(`/jobs/${job.id}`);
                onUpdate();
                alert("Serviço excluído!");
            } catch (err) {
                alert("Erro ao excluir serviço.");
            } finally {
                setGlobalLoading(false);
            }
        }
    };

    const handleMover = async (direcao: 'subir' | 'descer') => {

        setGlobalLoading(true);
        try {
            await api.patch(`/jobs/${job.id}/ordem`, { direcao });
            onUpdate();
        } catch (err) {
            console.error("Erro ao mover item");
        } finally {
            setGlobalLoading(false);
        }
    };

    const createSlug = (text: string) => {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
    };

    const handleSelectService = () => {
        const slug = createSlug(job.nome);
        navigate(`/formulario/${slug}`);
    }

    return (
        <div className="max-w-262.5 border-b border-gray-800 p-4 max-[610px]:p-0 hover:bg-[#1a1a1a] transition-colors">
            <div className="flex items-center gap-4 max-[610px]:gap-0">
                <div className="flex flex-col">
                    {isAdmin && (
                        <button onClick={() => handleMover('subir')} className="text-gray-500 hover:text-orange-combat">
                            ▲
                        </button>
                    )}
                    {isAdmin && (
                        <button onClick={() => handleMover('descer')} className="text-gray-500 hover:text-orange-combat">
                            ▼
                        </button>
                    )}
                </div>

                <div className="min-[320px]:hidden min-[610px]:flex w-16 h-16 shrink-0 bg-neutral-grayish flex items-center justify-center border border-gray-700 relative max-[610px]:mr-3">
                    {isEditing ? (
                        <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                            <input type="file" className="hidden" onChange={handleFileChange} />
                            {preview || job.icone ? (
                                <img src={preview || job.icone} className="w-10 h-10 object-contain opacity-50" />
                            ) : <span className="text-[10px]">Upload</span>}
                            <span className="absolute bottom-0 text-[8px] bg-orange-combat w-full text-center">TROCAR</span>
                        </label>
                    ) : (
                        <img
                            src={job.icone ? job.icone : "./icons/default-icon.svg"}
                            alt={job.nome}
                            crossOrigin="anonymous"
                            className="w-12 h-12 object-contain"
                        />
                    )}
                </div>

                <div className="flex-1">
                    {isEditing ? (

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] text-gray-400">POSIÇÃO:</label>
                            <input
                                type="number"
                                className="bg-black border border-gray-600 p-1 text-sm text-white w-20"
                                value={editData.ordem}
                                onChange={e => setEditData({ ...editData, ordem: e.target.value })}
                            />
                            <input
                                className="bg-black border border-gray-600 p-1 text-sm text-orange-combat font-bold uppercase"
                                value={editData.nome}
                                onChange={e => setEditData({ ...editData, nome: e.target.value })}
                            />
                            <textarea
                                className="bg-black border border-gray-600 p-1 text-sm text-gray-400"
                                value={editData.descricao}
                                onChange={e => setEditData({ ...editData, descricao: e.target.value })}
                            />
                            <div className="flex gap-3">
                                <input
                                    className="bg-black border border-gray-600 p-1 text-sm text-orange-combat"
                                    value={editData.preco}
                                    onChange={e => setEditData({ ...editData, preco: e.target.value })}
                                />
                                <input
                                    className="bg-black border border-gray-600 p-1 text-sm text-orange-combat"
                                    value={editData.desc}
                                    onChange={e => setEditData({ ...editData, desc: e.target.value })}
                                />
                                <input
                                    className="bg-black border border-gray-600 p-1 text-sm text-orange-combat"
                                    value={editData.total}
                                    onChange={e => setEditData({ ...editData, total: e.target.value })}
                                />
                            </div>
                            <select
                                className="bg-black border border-gray-600 p-1 text-sm text-white"
                                value={editData.genero}
                                onChange={e => setEditData({ ...editData, genero: e.target.value })}
                            >
                                <option value="">Selecione um gênero</option>
                                <option value="fisico">Presencial</option>
                                <option value="online">On-line</option>
                            </select>
                            <input
                                className="bg-black border border-gray-600 p-1 text-[10px] text-orange-pailed italic"
                                value={editData.infos_uteis}
                                onChange={e => setEditData({ ...editData, infos_uteis: e.target.value })}
                            />
                            <div className="flex gap-2 mt-2">
                                <button onClick={handleUpdate} className="bg-green-700 text-white px-3 py-1 text-[10px] font-bold">SALVAR</button>
                                <button onClick={() => setIsEditing(false)} className="bg-gray-700 text-white px-3 py-1 text-[10px] font-bold">CANCELAR</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex min-w-0 justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-bold text-orange-combat uppercase">{job.nome}</h3>
                                    {job.genero === 'online' && (
                                        <button
                                            onClick={handleSelectService}
                                            className="cursor-pointer text-[12px] bg-white text-black px-2 h-5 font-bold hover:bg-orange-combat hover:text-white transition-all"
                                        >
                                            PEDIR
                                        </button>
                                    )}
                                </div>
                                {isAdmin && !isEditing && (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="cursor-pointer text-[10px] bg-white text-black px-2 py-1 font-bold hover:bg-orange-combat hover:text-white transition-all"
                                        >
                                            EDITAR
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="cursor-pointer text-[10px] bg-red-600 text-white px-2 py-1 font-bold hover:bg-white hover:text-red-600 transition-all"
                                        >
                                            EXCLUIR
                                        </button>
                                    </>
                                )}
                            </div>
                            <p className="text-gray-400 text-sm mt-1">{job.descricao}</p>
                            {job.infos_uteis && (
                                <span className="text-[10px] text-orange-pailed mt-2 block italic">💡 {job.infos_uteis}</span>
                            )}
                        </>
                    )}
                </div>
                <div>
                    {isLogged && user ? (
                        <div className="flex flex-col items-end gap-1.5">
                            <p className="text-center text-[12px] "><span className="bg-orange-combat text-white px-2 py-px w-23.5 font-semibold">R$ {job.preco}</span></p>
                            <p className="text-center text-[12px] "><span className="bg-orange-combat text-white px-2 py-px w-23.5 font-semibold">- {job.desc}</span></p>
                            <p className="text-center text-[12px] "><span className="bg-orange-combat text-white px-2 py-px w-23.5 font-semibold">= {job.total}</span></p>
                        </div>
                    ) : (
                        ''
                    )}
                </div>

            </div>
        </div>
    );
};