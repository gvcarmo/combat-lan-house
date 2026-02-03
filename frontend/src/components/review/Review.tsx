import { useRef, useEffect, useState, useContext } from "react";
import api from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";

// const review = [
//     { icon: './test/01.svg', name: 'Antonio Carlos Alvino', stars: 5, description: 'Top ! atendimento nota 10 sempre' },
//     { icon: './test/03.svg', name: 'Gustavo Donizetti', stars: 5, description: 'Excelente' },
//     { icon: './test/02.svg', name: 'Eliana Lemos', stars: 5, description: 'Ótima!' },
//     { icon: './test/04.png', name: 'Luzia Ferreira Sampaio', stars: 5, description: 'Ótimo atendimento' },
//     { icon: './test/05.png', name: 'Matheus Cassimiro dias', stars: 5, description: 'Muito bom' },
//     { icon: './test/06.png', name: 'Emanuel Carlos', stars: 5, description: 'Melhor que tem' },
//     { icon: './test/07.png', name: 'Andre11 Rodrigues', stars: 5, description: 'Excelente qualidade' },
//     { icon: './test/08.png', name: 'Luiz Humberto', stars: 5, description: 'Ótima' },
//     { icon: './test/09.png', name: 'Vanessa Jeremias Rodrigues', stars: 5, description: 'Excelente' },
//     { icon: './test/10.png', name: 'Henrique Ferraz', stars: 5, description: 'Pessoas boas e gentis' },
// ]

interface Review {
    id: number;
    avatar: string;
    nome: string;
    stars: number | string;
    descricao: string;
}

export const Reviews = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [preview, setPreview] = useState<string>('');

    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [isEditing, setIsEditing] = useState(false);


    const { isAdmin } = useContext(AuthContext);

    const totalItems = reviews.length
    let itemsVisible = 3;

    const width = window.innerWidth;
    if (width > 1140) {
        itemsVisible = 3;
    } else if (width > 610) {
        itemsVisible = 2;
    } else if (width > 320) {
        itemsVisible = 1;
    } else {
        itemsVisible = 3;
    }

    const maxIndex = Math.max(0, totalItems - itemsVisible)

    const prevSlide = () => { if (currentIndex > 0) setCurrentIndex(prev => prev - 1); };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }

    const canPrev = currentIndex > 0
    const canNext = currentIndex < maxIndex

    const containerRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 4000);

        return () => clearInterval(timer);
    }, [currentIndex]);

    const [newReview, setNewReview] = useState({
        avatar: '',
        nome: '',
        stars: '',
        descricao: ''
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    }

    useEffect(() => {
        api.get('/reviews').then(res => setReviews(res.data));
    }, []);

    const fetchReviews = async () => {
        const res = await api.get('/reviews');
        setReviews(res.data);
    }

    const handleCreateReview = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSending(true);

        const formData = new FormData();
        formData.append('nome', newReview.nome);
        formData.append('stars', String(newReview.stars));
        formData.append('descricao', newReview.descricao);

        if (file) formData.append('midia', file);

        try {
            await api.post('/reviews', formData);

            alert("Avaliação cadastrada com sucesso!");

            setNewReview({ avatar: '', nome: '', stars: '', descricao: '' });

            setFile(null);
            setShowAddForm(false);
            fetchReviews();
            setIsEditing(false);
        } catch (err) {
            alert("Erro no upload.");
        } finally {
            setIsSending(false);
        }
    }

    const handleEditReview = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingReview || !editingReview.id) {
            console.error("ID da avaliação não encontrada.", editingReview);
            alert("Erro: Não foi possível identificar a avaliação para edição.");
            return;
        }

        const formData = new FormData();

        formData.append('nome', editingReview.nome);
        formData.append('stars', String(editingReview.stars));
        formData.append('descricao', editingReview.descricao);

        if (file) {
            formData.append('midia', file);
        } else {
            formData.append('midia', editingReview.avatar);
        }

        try {
            await api.put(`/reviews/${editingReview.id}`, formData);
            alert("Avaliação atualizada com sucesso!");
            setEditingReview(null);
            fetchReviews();
        } catch (err) {
            alert("Erro ao editar o avaliação.");
        }
    }

    const handleDelete = async (id: number | string) => {
        if (window.confirm(`Tem certeza que deseja excluir esta avaliação?`)) {
            try {
                await api.delete(`/reviews/${id}`);
                alert("Avaliação excluída!");
                fetchReviews();
            } catch (err) {
                alert("Erro ao excluir avaliação.")
            }
        }
    }

    return (
        <div className="flex flex-col items-center justify-center">
            {isAdmin ?
                <div className="my-2.5 py-5 flex flex-col items-center justify-center bg-neutral-dark-grayish min-[1139px]:w-280 min-[610px]:w-139 min-[320px]:w-71">
                    <button className="ml-4 bg-orange-combat hover:bg-white hover:text-orange-combat transition-all px-6 py-2 font-bold" onClick={() => setShowAddForm(!showAddForm)}>{showAddForm ? "Fechar" : "+ Nova Avaliação"}</button>
                </div>

                : ''
            }

            {showAddForm && (
                <div className="min-[1139px]:w-280 min-[610px]:w-139 min-[320px]:w-71  mb-2.5 p-6 border border-orange-combat/50 bg-[#1a1a1a] shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
                    <h2 className="text-xl font-bold mb-6 text-orange-combat uppercase tracking-wider">
                        Nova Avaliação
                    </h2>

                    <form onSubmit={handleCreateReview} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-400 ml-1">Nome do cliente</label>
                            <input
                                required
                                className="p-3 bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors"
                                placeholder="Ex: Cárita Vittorazze do Carmo"
                                value={newReview.nome}
                                onChange={e => setNewReview({ ...newReview, nome: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-400 ml-1">Avatar do Cliente</label>
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
                            <label className="text-xs text-gray-400 ml-1">Quantidade de Estrelas</label>
                            <input
                                required
                                className="p-3 bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors"
                                placeholder="Ex: Estrelas deixadas na avaliação (default 1)."
                                value={newReview.stars}
                                onChange={e => setNewReview({ ...newReview, stars: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-400 ml-1">Mensagem do cliente</label>
                            <input
                                required
                                className="p-3 bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors"
                                placeholder="Ex: Mensagem que o cliente deixou ao avaliar."
                                value={newReview.descricao}
                                onChange={e => setNewReview({ ...newReview, descricao: e.target.value })}
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
                                {isSending ? 'Salvando...' : 'Salvar Avaliação'}
                            </button>
                        </div>

                    </form>

                </div>
            )}

            <div className="flex items-center justify-center relative">

                <button
                    onClick={prevSlide}
                    disabled={!canPrev}
                    className="button border border-neutral-very-light-grayish left-[11.3%] cursor-pointer h-10 w-6.5 bg-neutral-grayish flex items-center justify-center hover:scale-103 transition-all duration-100 ease-in-out" >
                    <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.72 17.92L-3.51667e-06 8.96001L8.72 1.04904e-05H15.76L7.04 8.96001L15.76 17.92H8.72Z" fill="white" />
                    </svg>
                </button>

                <div className="min-[1139px]:w-280 min-[610px]:w-139 min-[320px]:w-71 overflow-hidden flex mb-2.5" ref={containerRef}>
                    <div className="min-[1139px]:w-92.5 min-[610px]:w-69 min-[320px]:w-70 carousel-list flex gap-2.5 h-47.5 border border-neutral-very-light-grayish"
                        style={{ transform: `translateX(-${currentIndex * (102.8)}%)` }}>

                        {reviews.map((review) => (
                            <div key={review.id} className="min-[320px]:w-71 flex gap-5 p-5 max-[610px]:p-2 text-white bg-neutral-grayish border border-neutral-very-light-grayish "
                                style={{ flex: `0 0 ${100}%` }}>
                                {editingReview?.id === review.id ? (
                                    <div className="text-white flex flex-col  max-[610px]:gap-2 justify-between">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-2">
                                                <label htmlFor="">Nome:</label>
                                                <input
                                                    className="bg-black border border-gray-600 p-1 text-sm text-orange-combat font-bold uppercase"
                                                    type="text"
                                                    value={editingReview.nome}
                                                    onChange={e => setEditingReview({ ...review, nome: e.target.value })} />
                                            </div>

                                            <div className="flex gap-2">
                                                <label htmlFor="">Estrelas:</label>
                                                <input type="text"
                                                    className="w-42 bg-black border border-gray-600 p-1 text-sm text-gray-400"
                                                    value={editingReview.stars}
                                                    onChange={e => setEditingReview({ ...review, stars: e.target.value })}
                                                />
                                            </div>

                                            <div className="flex gap-2">
                                                <label htmlFor="">Comentário:</label>
                                                <input type="text"
                                                    className="w-42 bg-black border border-gray-600 p-1 text-sm text-gray-400"
                                                    value={editingReview.descricao}
                                                    onChange={e => setEditingReview({ ...review, descricao: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button className="bg-green-700 text-white px-3 py-1 text-[10px] font-bold h-5" onClick={handleEditReview}>SALVAR</button>
                                            <button onClick={() => setEditingReview(null)} className="bg-gray-700 text-white px-3 py-1 text-[10px] font-bold h-5">CANCELAR</button>
                                        </div>
                                    </div>
                                ) : (

                                    <div className="flex gap-5">
                                        <div>
                                            <img className="w-12.5" src={review.avatar} alt="Avatar" />
                                        </div>
                                        <div>
                                            <p className="text-[18px] font-semibold">{review.nome}</p>

                                            <div className="flex gap-1">
                                                {Array.from({ length: Number(review.stars) }).map((_, i) => (
                                                    <img key={i} className="h-4 my-2" src="./icons/star.png" alt="Stars" />
                                                ))}
                                            </div>

                                            <p>{review.descricao}</p>
                                        </div>

                                        {isAdmin && !isEditing && (
                                            <div className="flex max-[1140px]:flex-col gap-2">
                                                <button onClick={() => setEditingReview({ ...review })}
                                                    className="h-5 text-[10px] bg-white text-black px-2 py-1 font-bold hover:bg-orange-combat hover:text-white transition-all"
                                                >
                                                    EDITAR
                                                </button>

                                                <button onClick={() => handleDelete(review.id)}
                                                    className="h-5 text-[10px] bg-red-600 text-white px-2 py-1 font-bold hover:bg-white hover:text-red-600 transition-all"
                                                >
                                                    EXCLUIR
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                </div>

                <button onClick={nextSlide} disabled={!canNext}
                    className="button right-[10.5%] cursor-pointer h-10 w-6.5 bg-neutral-grayish border border-neutral-very-light-grayish flex items-center justify-center hover:scale-103 transition-all duration-100 ease-in-out" >
                    <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.5034e-06 1.04904e-05H7.08L15.8 8.96001L7.08 17.92H2.5034e-06L8.76 8.96001L2.5034e-06 1.04904e-05Z" fill="white" />
                    </svg>
                </button>

            </div>

        </div>
    )
}