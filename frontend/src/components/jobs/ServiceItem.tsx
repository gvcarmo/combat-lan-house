import { useState } from "react";
import api from "../../services/api";

interface JobProps {
    job: any;
    isAdmin: boolean;
    onUpdate?: any;
}

export const ServiceItem = ({ job, isAdmin, onUpdate }: JobProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ ...job });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>("");

    const API_URL = "http://localhost:3000/uploads/"

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
        
        if (selectedFile) formData.append('icone', selectedFile);

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
        }
    };

    const handleDelete = async () => {
        if (window.confirm(`Tem certeza que deseja excluir o serviço "${job.nome}"?`)) {
            try {
                await api.delete(`/jobs/${job.id}`);
                onUpdate();
                alert("Serviço excluído!");
            } catch (err) {
                alert("Erro ao excluir serviço.");
            }
        }
    };

    const handleMover = async (direcao: 'subir' | 'descer') => {
        try {
            await api.patch(`/jobs/${job.id}/ordem`, { direcao });
            onUpdate();
        } catch (err) {
            console.error("Erro ao mover item");
        }
    };

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
                                <img src={preview || `${API_URL}/${job.icone}`} className="w-10 h-10 object-contain opacity-50" />
                            ) : <span className="text-[10px]">Upload</span>}
                            <span className="absolute bottom-0 text-[8px] bg-orange-combat w-full text-center">TROCAR</span>
                        </label>
                    ) : (                        
                        <img
                            src={job.icone ? `${API_URL}${job.icone}` : "./icons/default-icon.svg"}
                            alt={job.nome}
                            className="w-12 h-12 object-contain"
                        />
                    )}
                </div>

                {/* ÁREA DE TEXTO */}
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
                                <h3 className="text-xl font-bold text-orange-combat uppercase">{job.nome}</h3>
                                {isAdmin && !isEditing && (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="text-[10px] bg-white text-black px-2 py-1 font-bold hover:bg-orange-combat hover:text-white transition-all"
                                        >
                                            EDITAR
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="text-[10px] bg-red-600 text-white px-2 py-1 font-bold hover:bg-white hover:text-red-600 transition-all"
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
            </div>
        </div>
    );
};