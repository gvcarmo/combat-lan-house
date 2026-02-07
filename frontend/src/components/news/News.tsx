import { useContext, useEffect, useRef, useState } from "react";
import api from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";

interface Post {
    id: string;
    data: string;
    descricao: string;
    video_url: string;
    post_link: string;
}

export const News = () => {

    const [isSending, setIsSending] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isImageUpload, setIsImageUpload] = useState(true);

    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const { isAdmin, setGlobalLoading } = useContext(AuthContext);


    const totalItems = posts.length

    let itemsVisible = 2;

    const width = window.innerWidth;
    if (width > 1140) {
        itemsVisible = 2;
    } else if (width > 320) {
        itemsVisible = 1;
    }

    const [currentIndex, setCurrentIndex] = useState(0);

    const maxIndex = Math.max(0, totalItems - itemsVisible)

    const prevSlide = () => { if (currentIndex > 0) setCurrentIndex(prev => prev - 1); };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }

    const canNext = currentIndex < maxIndex;
    const canPrev = currentIndex > 0;

    const containerRef = useRef(null);

    const [newPost, setNewPost] = useState({
        data: '',
        video_url: '',
        descricao: '',
        post_link: ''
    });

    useEffect(() => {
        api.get('/posts').then(res => setPosts(res.data));
    }, []);

    const fetchPosts = async () => {
        const res = await api.get('/posts');
        setPosts(res.data);
    }

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSending(true);

        const formData = new FormData();
        formData.append('data', newPost.data);
        formData.append('descricao', newPost.descricao);
        formData.append('post_link', newPost.post_link);

        if (isImageUpload && selectedFile) {
            formData.append('midia', selectedFile);
        } else {
            formData.append('midia', newPost.video_url);
        }

        setGlobalLoading(true);
        try {
            await api.post('/posts', formData);

            alert("Post cadastrado com sucesso!");
            setSelectedFile(null);
            fetchPosts();
            setIsEditing(false);

        } catch (err) {
            alert("Erro ao cadastrar post.")
        } finally {
            setIsSending(false);
            setGlobalLoading(false);
        }
    }

    const handleEditPost = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingPost || !editingPost.id) {
            console.error("ID do post não encontrado", editingPost);
            alert("Erro: Não foi possível identificar o post para edição.");
            return;
        }

        const formData = new FormData();

        formData.append('data', String(editingPost.data));
        formData.append('descricao', editingPost.descricao);
        formData.append('post_link', editingPost.post_link);

        if (selectedFile) {
            formData.append('midia', selectedFile);
        } else {
            formData.append('midia', editingPost.video_url);
        }

        setGlobalLoading(true);
        try {
            await api.put(`/posts/${editingPost.id}`, formData);
            alert("Post atualizado com sucesso!");
            fetchPosts();
            setEditingPost(null);
        } catch (err) {
            alert("Erro ao editar o post.");
        } finally {
            setGlobalLoading(false);
        }
    };

    const handleDelete = async (id: number | string) => {
        if (window.confirm(`Tem certeza que deseja excluir este post?`)) {

            setGlobalLoading(true);
            try {
                await api.delete(`/posts/${id}`);
                alert("Post excluído!");
                fetchPosts();
            } catch (err) {
                alert("Erro ao excluir post.");
            } finally {
                setGlobalLoading(false);
            }
        }
    }

    return (
        <div className="flex flex-col items-center justify-center">
            {isAdmin ?
                <div className="my-2.5 py-5 flex flex-col items-center justify-center bg-neutral-dark-grayish min-[1139px]:w-280 min-[610px]:w-139 min-[320px]:w-71">

                    <button className="cursor-pointer ml-4 bg-orange-combat hover:bg-white hover:text-orange-combat transition-all px-6 py-2 font-bold" onClick={() => setShowAddForm(!showAddForm)}>{showAddForm ? "Fechar" : "+ Novo Post"}</button>
                </div>

                : ''
            }

            {showAddForm && (
                <div className="min-[1139px]:w-280 min-[610px]:w-139 min-[320px]:w-71  mb-2.5 p-6 border border-orange-combat/50 bg-[#1a1a1a] shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
                    <h2 className="text-xl font-bold mb-6 text-orange-combat uppercase tracking-wider">
                        Novo Post
                    </h2>

                    <form onSubmit={handleCreatePost} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-400 ml-1">Data do post</label>
                            <input
                                required
                                className="p-3 bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors"
                                placeholder="Ex: postado 01 de Janeiro de 2026"
                                value={newPost.data}
                                onChange={e => setNewPost({ ...newPost, data: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-400 ml-1">URL do Vídeo ou Imagem</label>
                            <input
                                className="p-3 bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors"
                                placeholder="Ex: https://player.vimeo.com/video/1147430791?h=1b79dd185f"
                                value={newPost.video_url}
                                onChange={e => setNewPost({ ...newPost, video_url: e.target.value })}
                            />
                            <div className="flex gap-4 mb-2">
                                <button type="button" onClick={() => setIsImageUpload(false)} className={!isImageUpload ? "text-orange-combat" : ""}>Link Vídeo</button>
                                <button type="button" onClick={() => setIsImageUpload(true)} className={isImageUpload ? "text-orange-combat" : ""}>Upload Img (248x442)</button>
                            </div>
                            {isImageUpload ? (
                                <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="" />
                            ) : (
                                <input value={newPost.video_url} onChange={(e) => setNewPost({ ...newPost, video_url: e.target.value })} placeholder="URL do Vídeo" className="..." />
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-400 ml-1">Descrição</label>
                            <input
                                required
                                className="p-3 bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors"
                                placeholder="Ex: Falar sobre o post em si."
                                value={newPost.descricao}
                                onChange={e => setNewPost({ ...newPost, descricao: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-400 ml-1">Link do Post no Instagram</label>
                            <input
                                className="p-3 bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors"
                                placeholder="Ex: https://www.instagram.com/p/DSXzvoBETE0/"
                                value={newPost.post_link}
                                onChange={e => setNewPost({ ...newPost, post_link: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="cursor-pointer px-6 py-2 border border-gray-600 hover:bg-gray-800 transition-all uppercase text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                disabled={isSending}
                                type="submit"
                                className={`cursor-pointer px-10 py-2 bg-orange-combat hover:bg-white hover:text-orange-combat font-bold transition-all uppercase text-sm ${isSending ? 'opacity-50' : ''}`}
                            >
                                {isSending ? 'Salvando...' : 'Salvar Post'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="my-2.5 flex items-center justify-center relative">

                <button
                    onClick={prevSlide}
                    disabled={!canPrev}
                    className="button top-[50%] left-[10.5%] cursor-pointer h-10 w-6.5 bg-neutral-grayish border border-neutral-very-light-grayish flex items-center justify-center hover:scale-103 transition-all duration-100 ease-in-out" >
                    <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.72 17.92L-3.51667e-06 8.96001L8.72 1.04904e-05H15.76L7.04 8.96001L15.76 17.92H8.72Z" fill="white" />
                    </svg>
                </button>

                <div className="min-[1139px]:w-280 min-[610px]:w-139 min-[320px]:w-71 overflow-hidden flex" ref={containerRef}>
                    <div
                        className="carousel-list flex gap-2.5 w-141.25 pl-2.5"
                        style={{ transform: `translateX(-${currentIndex * 565 + 10}px)` }} >

                        {posts.map((post) => (
                            <div
                                key={post.id}
                                style={{ flex: `0 0 ${100}%` }}
                                className="min-[320px]:w-71">

                                {editingPost?.id === post.id ? (
                                    <div className="bg-neutral-dark-grayish p-2.5 text-white flex max-[610px]:flex-col  max-[610px]:gap-2 justify-between">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-2">
                                                <label htmlFor="">Data:</label>
                                                <input
                                                    className="bg-black border border-gray-600 p-1 text-sm text-orange-combat font-bold uppercase"
                                                    type="text"
                                                    value={editingPost.data}
                                                    onChange={e => setEditingPost({ ...post, data: e.target.value })} />
                                            </div>

                                            <div className="flex gap-2">
                                                <label htmlFor="">Descrição:</label>
                                                <textarea
                                                    className="w-42 h-50 bg-black border border-gray-600 p-1 text-sm text-gray-400"
                                                    value={editingPost.descricao}
                                                    onChange={e => setEditingPost({ ...post, descricao: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <label htmlFor="">Link no insta:</label>
                                                <input type="text"
                                                    className="w-37.5 bg-black border border-gray-600 p-1 text-sm text-gray-400"
                                                    value={editingPost.post_link}
                                                    onChange={e => setEditingPost({ ...post, post_link: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button className="cursor-pointer bg-green-700 text-white px-3 py-1 text-[10px] font-bold h-5 hover:bg-green-400 transition-all duration-250 ease-in-out" onClick={handleEditPost}>SALVAR</button>
                                            <button onClick={() => setEditingPost(null)} className="cursor-pointer transition-all duration-300 ease-in-out hover:bg-gray-400 bg-gray-700 text-white px-3 py-1 text-[10px] font-bold h-5">CANCELAR</button>
                                        </div>
                                    </div>
                                ) : (

                                    <div className="bg-neutral-grayish-post border border-neutral-very-light-grayish pl-5 py-3.5 text-white flex max-[610px]:flex-col justify-between">
                                        <p className="min-[320px]:flex max-[610px]:flex-col"><span className="font-bold text-[18px] min-[320px]:text-[16px]">@combatlanhouse</span><span className="text-[16px] min-[320px]:text-[14px]">&nbsp;- {post.data}</span></p>
                                        <div className="flex gap-2 mr-2">
                                            {isAdmin && !isEditing && (
                                                <>
                                                    <button onClick={() => setEditingPost({ ...post })}
                                                        className="cursor-pointer text-[10px] bg-white text-black px-2 py-1 font-bold hover:bg-orange-combat hover:text-white transition-all"
                                                    >
                                                        EDITAR
                                                    </button>

                                                    <button onClick={() => handleDelete(post.id)}
                                                        className="cursor-pointer text-[10px] bg-red-600 text-white px-2 py-1 font-bold hover:bg-white hover:text-red-600 transition-all"
                                                    >
                                                        EXCLUIR
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                    </div>

                                )}

                                <div className="p-4 flex min-[320px]:flex-col min-[610px]:flex-row gap-4 bg-neutral-grayish border border-neutral-very-light-grayish">
                                    <div className="w-62.5 h-111 flex items-center justify-center overflow-hidden border border-gray-800">
                                        {post.video_url.startsWith('http') ? (
                                            <iframe
                                                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                                                src={post.video_url}
                                                className="w-full h-full pointer-events-none"
                                                title="Video post"
                                            />
                                        ) : (
                                            <img
                                                src={post.video_url.startsWith('http') ? post.video_url : `${post.video_url}`}
                                                alt="Post content"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;

                                                    e.currentTarget.src = "https://placehold.co/250x444?text=Sem+Imagem";

                                                }}
                                            />
                                        )}
                                    </div>

                                    <div className="w-62.5 text-white flex flex-col justify-between">
                                        <p className="mt-2.5">{post.descricao}</p>
                                        <div className="flex items-center gap-1">
                                            <img className="w-5" src="./icons/insta.svg" alt="Insta" />
                                            <span className="font-semibold">Insta: </span><a className="hover:text-orange-combat transition-all duration-150 ease-in-out" href={post.post_link} target="_blank">@combatlanhouse</a>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={nextSlide} disabled={!canNext}
                    className="button top-[50%] right-[10.5%] cursor-pointer h-10 w-6.5 bg-neutral-grayish border border-neutral-very-light-grayish flex items-center justify-center hover:scale-103 transition-all duration-100 ease-in-out" >
                    <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.5034e-06 1.04904e-05H7.08L15.8 8.96001L7.08 17.92H2.5034e-06L8.76 8.96001L2.5034e-06 1.04904e-05Z" fill="white" />
                    </svg>
                </button>

            </div>
        </div >
    )
};