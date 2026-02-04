export const Loader = () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-orange-combat border-gray-800 rounded-full animate-spin"></div>
            <span className="text-white mt-4 uppercase font-bold tracking-widest">Carregando Combat...</span>
        </div>
    </div>
);