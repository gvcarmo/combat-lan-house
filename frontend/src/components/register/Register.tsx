import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import api from "../../services/api";
import { Link, useNavigate } from "react-router-dom";

interface Register {
    nick: string;
    nome_completo: string;
    email: string;
    senha: string;
    nivel_acesso: string;
}

export const Register = () => {

    const { isLogged, user, setGlobalLoading } = useContext(AuthContext);
    const [_register, setRegister] = useState<Register[]>([]);
    const [isSending, setIsSending] = useState(false);

    const [termosIsShowing, setTermosIsShowing] = useState(false);

    const navigate = useNavigate();

    const [newRegister, setNewRegister] = useState({
        nick: '',
        nome_completo: '',
        email: '',
        senha: '',
        nivel_acesso: 'user'
    });

    const fetchRegister = async () => {
        const res = await api.get('/usuarios');
        setRegister(res.data);
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSending(true);

        setGlobalLoading(true);
        try {
            await api.post('/usuarios', {
                nick: newRegister.nick,
                nome_completo: newRegister.nome_completo,
                email: newRegister.email,
                senha: newRegister.senha,
                nivel_acesso: newRegister.nivel_acesso
            })

            alert("Cadastro realizado com sucesso!");
            fetchRegister();
            navigate('/');
        } catch (error) {
            alert("Erro ao se cadastrar, verifique as informações.")
        } finally {
            setIsSending(false);
            setGlobalLoading(false);
        }
    }

    function handleTermosShow() {
        setTermosIsShowing(!termosIsShowing);
    }

    const backCampoClass = `border-l-2 border-orange-combat bg-neutral-dark-grayish py-2 pl-4 flex flex-col gap-1 md:col-span-2 mb-6`
    const titleClass = `text-xs text-orange-combat uppercase font-bold mb-1`
    const campoClass = `p-1 mr-2 text-sm bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors resize-none`

    return (
        <>
            <div className="min-h-screen flex justify-center items-center bg-linear-to-r from-[#FF3300] via-[#FF5900] to-[#803100] py-2.5">
                <div id="jobs" className="min-[1139px]:w-280 min-[610px]:w-139 min-[320px]:w-71 flex flex-col items-center pb-5 bg-neutral-grayish border border-neutral-border-light-color text-white">

                    <div className="w-full flex gap-3 justify-end p-5">
                        <Link to={`/`} className="hover:text-orange-combat transition-all text-[14px]">Voltar para o início</Link>
                    </div>

                    <h1 className="text-center pb-5 text-[20px] font-semibold text-orange-combat">Formulário de Cadastro</h1>
                    {isLogged && user ? (
                        <div className="min-h-50 flex items-center justify-center mb-5">
                            <p>Você já está logado <strong>{user.nick}</strong>.</p>
                        </div>
                    ) : (
                        <div className="w-full p-8">
                            <div className="p-5 max-[610px]:p-0 flex flex-col items-center ">
                                <h4 className="italic pb-2.5">Ao se cadastrar você está concordando com nossos Termos de Condições de Uso:</h4>
                                <button className="cursor-pointer text-[14px] bg-orange-combat text-white px-3 py-1 w-fit hover:bg-gray-700 transition-colors mb-2.5" onClick={handleTermosShow}>{termosIsShowing ? 'Esconder Termos' : 'Mostrar Termos'}</button>
                                <div className={`${termosIsShowing ? '' : 'hidden'} max-[610px]:text-[14px] flex flex-col gap-3 h-60 overflow-y-auto custom-scrollbar border border-orange-combat p-3`}>

                                    <div className="flex flex-col">
                                        <p className="text-orange-combat font-semibold">POLÍTICA DE PRIVACIDADE</p>
                                        <p>• Política de Privacidade se refere as informações específicas de coleta, armazenamento e proteção de dados pessoais de usuários em nosso site.</p></div>
                                    <div className="flex">
                                        <p>• Os dados pessoais aqui coletados no cadastro do usuário, são de identificação básicos, como (nome completo e email) são mantidos na plataforma sob restrição, não sendo divulgada sob nenhuma hipótese. A partir destes dados, podemos identificar o usuário e o visitante, além de garantir uma maior segurança e bem-estar às suas necessidades. Nós da administração não iremos pedir nenhuma informação a não ser por um canal especificado dentro do site, como nosso chat ou whatsapp, verifique se está mesmo sendo atendido em nossa plataforma.</p></div>
                                    <div className="flex">
                                        <p>• - Os dados necessários para realização de algum serviço, é utilizado apenas para a prestação do serviço na hora exata do mesmo, após fornecimento do serviço, nós só acessamos caso seja sob necessidade do cliente sob alguma circunstancia real, o usuário tem acesso ao serviço prestado em sua plataforma de cliente pelo tempo divulgado por nossa loja online.</p></div>

                                    <div className="flex flex-col">
                                        <p className="text-orange-combat font-semibold">SEÇÃO 2 - ALTERAÇÃO DA POLÍTICA DE PRIVACIDADE</p>
                                        <p>• - Reservamos o direito de modificar essa Política de Privacidade a qualquer momento, então é recomendável que o usuário e visitante revise-a com frequência.</p>
                                        <p>• - As alterações e esclarecimentos vão surtir efeito imediatamente após sua publicação na plataforma. Quando realizadas alterações os usuários serão notificados. Ao utilizar o serviço ou fornecer informações pessoais após eventuais modificações, o usuário e visitante demonstra sua concordância com as novas normas.</p>
                                    </div>

                                    <div className="flex flex-col">
                                        <p className="text-orange-combat font-semibold">TERMOS E CONDIÇÕES DE USO DOS NOSSOS SERVIÇOS FORNECIDOS PELO SITE</p>
                                        <p>• - Os serviços da COMBAT LAN HOUSE ONLINE são fornecidos pela pessoa jurídica, titular da propriedade intelectual sobre website, software, aplicativos e conteúdos aqui divulgados.</p>
                                        <p>1. - DO OBJETO:</p>
                                        <p>A plataforma visa licenciar o uso de seu website, software, aplicativos e demais ativos para auxiliar e dinamizar o dia a dia dos seus usuários.</p>
                                        <p>A plataforma caracteriza-se pela prestação do seguinte serviço: lan house - prestação de serviços virtuais.</p>
                                        <p>A plataforma realiza a prestação de serviços à distância por meio eletrônico.</p>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-orange-combat font-semibold">2. DA ACEITAÇÃO</p>
                                        <p>O presente Termo estabelece obrigações contratadas de livre e espontânea vontade, por tempo indeterminado, entre a plataforma e as pessoas físicas ou jurídicas, usuárias do OU site OU aplicativo.</p>
                                        <p>Ao utilizar a plataforma o usuário aceita integralmente as presentes normas e compromete-se a observá-las, sob o risco de aplicação das penalidade cabíveis.</p>
                                        <p>A aceitação do presente instrumento é imprescindível para o acesso e para a utilização de quaisquer serviços fornecidos pela empresa. Caso não concorde com as disposições deste instrumento, o usuário não deve utilizá-los.</p>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-orange-combat font-semibold">3. DO ACESSO DOS USUÁRIOS</p>
                                        <p>Serão utilizadas todas as soluções técnicas à disposição do responsável pela plataforma para permitir o acesso ao serviço 24 (vinte e quatro) horas por dia, 7 (sete) dias por semana. No entanto, a navegação na plataforma ou em alguma de suas páginas poderá ser interrompida, limitada ou suspensa para atualizações, modificações ou qualquer ação necessária ao seu bom funcionamento.</p>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-orange-combat font-semibold">4. DO CADASTRO</p>
                                        <p>O acesso às funcionalidades da plataforma exigirá a realização de um cadastro prévio e, a depender dos serviços ou produtos escolhidos, o pagamento de determinado valor.</p>
                                        <p>Ao se cadastrar o ousuário deverá informar dados completos, recentes e válidos, sendo de sua exclusiva responsabilidade manter referidos dados atualizados, bem como o usuário se compromete com a veracidade dos dados fornecidos.</p>
                                        <p>O usuário se compromete a não informar seus dados cadastrais e/ou de acesso à plataforma a terceiros, responsabilizando-se integralmente pelo uso que deles seja feito.</p>
                                        <p>Menores de 18 anos e aqueles que não possuírem plena capacidade civil deverão obter previamente o consentimento expresso de seus resopnsáveis legais para utilização da plataforma e dos serviços ou produtos, sendo de responsabilidade exclusiva dos mesmos o eventual acesso por menores de idade e por aqueles que não possuem plena capacidade civil sem a prévia autorização.</p>
                                        <p>Mediante a realização do cadastro o usuário declara e garante expressamente ser plenamente capaz, podendo exercer e usufruir livremente dos serviços e produtos.</p>
                                        <p>O usuário deverá fornecer um endereço de e-mail válido, através do qual o site realizará todas comunicações necessárias.</p>
                                        <p>Após a confirmação do cadastro, o usuário possuirá um login e uma senha pessoal, a qual assegura ao usuário o acesso individual à mesma. Desta forma, compete ao usuário exclusivamente a manutenção de referida senha de maneira confidencial e segura, evitando o acesso indevido às informações pessoais.</p>
                                        <p>Toda e qualquer atividade realizada com o uso da senha será de responsabilidade do usuário, que deverá informar prontamente a plataforma em caso de uso indevido da respectiva senha.</p>
                                        <p>Não será permitido ceder, vender, alugar, ou transferir, de qualquer forma, a conta, que é pessoal e intransferível.</p>
                                        <p>Caberá ao usuário assegurar que o seu equipamento seja compatível com as características técnicas que viabilize a utilização da plataforma e dos serviços ou produtos.</p>
                                        <p>usuário poderá, a qualquer tempo, requerer o cancelamento de seu cadastro junto ao site, ou aplicação. O seu descadastramento será realizado o mais rapidamente possível, desde que não sejam verificados débitos em aberto.</p>
                                        <p>O usuário, ao aceitar os Termos e Política de Privacidade, autoriza expressamente a plataforma a coletar, usar, armazenar, tratar, ceder ou utilizar as informações derivadas do uso dos serviços do site e quaisuqer plataformas, incluindo todas as informações preenchidas pelo usuário no momento em que realizar ou atualizar seu cadastro, além de outras expressamente descritas na Política de Privacidade que deverá ser autorizada pelo usuário.</p>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-orange-combat font-semibold">5. DOS SERVIÇOS</p>
                                        <p>A plataforma poderá disponibilizar para o usuário um conjunto específico de funcionalidades e ferramentas para otimizar o uso dos serviços e produtos.</p>
                                        <p>Na plataforma os serviços ou produtos oferecidos estão descritos e apresentados com o maior grau de exatidão, contendo informações sobre suas características, qualidades, quantidades, composição, preço, garantia, prazos de validade e origem, entre outros dados, bem como sobre os riscos que apresentam ao usuário.</p>
                                        <p>Antes de finalizar qualquer pedido de determinado serviço, o usuário deverá se informar sobre suas especificações e sobre a sua destinação.</p>
                                        <p>A entrega de serviços adquiridos na plataforma será informada no momento da finalização da compra.</p>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-orange-combat font-semibold">6. DOS PREÇOS</p>
                                        <p>A plataforma se reserva no direito de reajustar unilateralmente, a qualquer tempo, os valores dos serviços ou produtos sem consulta ou anuência prévia do usuário.</p>
                                        <p>Os valores aplicados são aqueles que estão em vigor no momento do pedido.</p>
                                        <p>Os preços são indicados em reais e não incluem qualquer outra taxa, se houver taxas especificadas a parte, serão informadas ao usuário antes da finalização do pedido.</p>
                                        <p>Na contratação de determinado serviço ou produto, a plataforma poderá solicitar as informações financeiras do usuário, como CPF, endereço de cobrança e chave PIX. Ao inserir referidos dados o usuário concorda que sejam cobrados, de acordo com a forma de pagamento que venha a ser escolhida, os preços então vigentes e informados quando da contratação. Referidos dados financeiros poderão ser armazenadas para facilitar acessos e contratações futuras.</p>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-orange-combat font-semibold">7. DO CANCELAMENTO</p>
                                        <p>Nós não temos obrigação alguma de devolver o dinheiro de determinado serviço prestado. Oferecemos todas as informações antes da prestação do serviço para que o cliente esteja bem informado. Antes de fazer o pagamento, o usuário tem acesso a exclusão do pedido realizado, ou edição das informações prestadas. Também é fornecido ao usuário um serviço de Ticket, para que ele possa contatar o Atendente e informar sobre qualquer informação que tenha prejudicado o mesmo.</p>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-orange-combat font-semibold">8. DA LOJA FÍSICA</p>
                                        <p>Nossa loja Física(presencial) e a loja online, são duas lojas separadas em atendimento, e também em preços. Os serviços prestados pela Loja física são tratados em canais específicos: em nossa página inicial do site, no canto inferior direito, há um botão para o usuário contatar a loja pelo Whatsapp (esse canal é exclusivo da loja presencial) ou no rodapé da página inicial, o cliente consegue ter o endereço da loja para visita-la. Os prazos e serviços prestados pela loja física são de total responsabilidade pela mesma, e deverá ser consultado pelos canais oferecidos.</p>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-orange-combat font-semibold">8. DA LOJA ONLINE</p>
                                        <p>A Loja Online oferece serviços por formulário, onde o usuário necessita de um cadastro para realizar um login e então pedir um serviço. No canto superior direito, há um botão de Login, caso o cliente não tenha cadastro ainda, há um link para realizar o cadastro. Após feito o login, no mesmo botão é habilitado o Painel de Controle, onde o usuário é levado para plataforma de prestação de serviços e atendimento, lá o usuário pode ver os serviços que estão disponíveis, os preços, e realizar o pedido.</p>
                                        <p>Após a realização do pedido, o usuário consegue edita-lo e fazer o pagamento, quando realizado o pagamento o usuário não pode mais excluir o pedido.</p>
                                        <p>Após a realização do pedido, o usuário será informado sobre o prazo para o atendimento, que pode variar de acordo com a hora, e o dia.</p>
                                        <p>Com o pedido entregue, o usuário consegue consultar em "Meus pedidos" o serviço realizado e os arquivos para download.</p>
                                        <p>Em qualquer situação onde o usuário necessite nos contatar, basta entrar na página de Abrir Ticket, e então iniciar um Ticket para ser atendido e retirar suas dúvidas relativas.</p>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-orange-combat font-semibold">8. DO SUPORTE</p>
                                        <p>LOJA FÍSICA (clique em contato):</p>
                                        <p>Para qualquer comunicação e atendimento na loja física, basta o cliente acessar a página inicial do nosso site, e clicar no botão do whatsapp oferecido no canto inferior direito da página, ele será redirecionado ao atendimento via whatsapp.</p>
                                        <p>Há também a opção de ir diretamente a loja, veja o endereço no rodapé do site.</p>
                                        <p>DA LOJA ONLINE:</p>
                                        <p>Para contatar a loja online, o usuário deve ter um cadastro e estar logado.</p>
                                        <p>Realize o cadastro clicando no botão Login, no canto superior direito, lá terá o link para se registrar. Após feito o registro clique no mesmo botão e realize o login. Após o login clique no mesmo botão e vá até o painel de controle.</p>
                                        <p>No painel de controle, o usuário tem a opção de Abrir Ticket, basta clicar lá que será atendido dentro de um determinado prazo.</p>
                                        <p>Qualquer atendimento via ticket pode levar um tempo e o usuário deve aguardar.</p>
                                        <p>OS CANAIS DE ATENDIMENTO SÃO INDIVIDUAIS, é de total responsabilidade do cliente não confundir os canais de atendimento, pois se o atendimento é da loja presencial não deve levantar questões da loja online, e vice versa.</p>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-orange-combat font-semibold">9. DAS RESPONSABILIDADES</p>
                                        <p>É de responsabilidade do usuário:</p>
                                        <p>a- defeitos ou vícios técnicos originados no próprio sistema do usuário;</p>
                                        <p>b- a correta utilização da plataforma, dos serviços ou produtos oferecidos, prezando pela boa convivência, respeito e cordialidade.</p>
                                        <p>c- pelo cumprimento e respeito ao conjunto de regras disposto nesse TERMO DE CONDIÇÕES GERAL DE USO, e na respectiva POLÍTICA DE PRIVACIDADE e na legislação nacional e internacional;</p>
                                        <p>d- pela proteção aos dados de acesso à sua conta/perfil (login e senha).</p>
                                        <p>É DE RESPONSABILIDADE DA PLATAFORMA:</p>
                                        <p>a- indicar as características do serviço;</p>
                                        <p>b- os defeitos e vícios encontrados no serviço ou produto oferecido desde que lhe tenha dado causa;</p>
                                        <p>c- as informações que foram por ele divulgadas, sendo que os comentários ou informações divulgadas por usuários são de inteira responsabilidade dos próprios usuários;</p>
                                        <p>d- os conteúdos ou atividades ilícitas praticadas através da sua plataforma.</p>
                                        <p>A plataforma não se responsabiliza por links externos contidos em seu sistema que possam redirecionar o usuário à ambiente externo a sua rede.</p>
                                        <p>Não poderão ser incluídos links externos ou páginas que sirvam para fins comerciais ou publicitários ou quaisquer informações ilícitas, violentas, polêmicas, pornográficas, xenofóbicas, discriminatórias ou ofensivas.</p>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-orange-combat font-semibold">9. DOS DIREITOS AUTORAIS</p>
                                        <p>O presente Termo de Uso concede aos usuários uma licença não exclusiva, não transferível e não sublicenciável, para acessar e fazer uso da plataforma e dos serviços por ela disponibilizados.</p>
                                        <p>A estrutura do site ou aplicativo, as marcas, logotipos, nomes comerciais, layouts, gráfcos e design de interface, imagens, ilustrações, fotografias, apresentações, vídeos, conteúdos escritos e de som e áudio, programas de computador, banco de dados, arquivos de transmissão e quaisquer outras informações e direitos de propriedade intelectual da razão social, observados os termos da Lei da <a href="https://www.jusbrasil.com.br/legislacao/91774/codigo-de-propriedade-industrial-lei-9279-96">Propriedade Industrial</a>(Lei nº 9.279/96), <a href="https://www.jusbrasil.com.br/legislacao/92175/lei-de-direitos-autorais-lei-9610-98">Lei de Direitos Autorais</a>(Lei nº 9.610/98) e <a href="https://www.jusbrasil.com.br/legislacao/109879/lei-do-software-lei-9609-98">Lei de Software</a>(Lei nº 9.609/98, estão devidamente reservados.</p>
                                        <p>Este Termos de Uso não cede ou transfere ao usuário qualquer direito, de modo que o acesso não gera qualquer direito de propriedade intelectual ao usuário, exceto pela licença limitada ora concedida.</p>
                                        <p>O uso da plataforma pelo usuário é pessoal, individual e intransferível, sendo vedado qualquer uso não autorizado, comercial ou não-comercial. Tais usos consistirão em violação dos direitos de propriedade intelectual da razão social, puníveis nos termos da legislação aplicável.</p>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-orange-combat font-semibold">10. DAS SANÇÕES</p>
                                        <p>Sem prejuízo das demais legais cabíveis, a razão social, poderã , a qualquer momento, advertir, suspender ou cancelar a conta do usuário:</p>
                                        <p>a- que violar qualquer dispositivo do presente Termo;</p>
                                        <p>b- que descumprir os seus deveres de usuário;</p>
                                        <p>c- que tiver qualquer comportamento fraudulento, doloroso ou que ofenda a terceiros.</p>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-orange-combat font-semibold">11. DAS ALTERAÇÕES</p>
                                        <p>Os itens descritos no presente instrumento poderão sofrer alterações, unilateralmente e a qualquer tempo, por parte da razão social, para adequar ou modificar os serviços, bem como para atender novas exigências legais. As alterações serão vinculadas OU pelo SITE ou pelo APLICATIVO e o usuário poderá optar por aceitar o novo conteúdo ou por cancelar o uso dos serviços.</p>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-orange-combat font-semibold">12. DA POLÍTICA DE PRIVACIDADE</p>
                                        <p>Além do presente Termo, o usuário deverá consentir com as disposições contidas na respectiva Política de Privacidade a ser apresentada a todos os interessados dentro da interface da plataforma.</p>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-orange-combat font-semibold">13. DO FORO</p>
                                        <p>Para a solução de controvérsias decorrente do presente instrumento será aplicado integralmente o Direito brasileiro.</p>
                                        <p>Os eventuais litígios deverão ser apresentados no foro da comarca em que se encontra a sede da empresa.</p>
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handleCreateUser} id="submit" action="post" className="flex flex-col p-5 max-[610px]:p-0">
                                <p className="text-orange-combat p-5"><strong>Obs.:</strong> Campos com * são obrigatórios.</p>

                                <div className="flex max-[610px]:flex-col">

                                    <div className={`${backCampoClass} w-2/3 max-[610px]:w-full`}>
                                        <label className={`${titleClass}`}>Usuário: *</label>
                                        <input required
                                            className={`${campoClass}`}
                                            type="text" minLength={4} maxLength={16}
                                            placeholder="Ex.: nomedeusuario"
                                            value={newRegister.nick}
                                            onChange={e => setNewRegister({ ...newRegister, nick: e.target.value })} />
                                    </div>
                                    <p className="text-[12px] p-5 max-[610px]:p-0 max-[610px]:pb-5">Obs.:<br />
                                        Deve conter ao menos 4 dígitos, e no máximo 16;
                                    </p>
                                </div>
                                <div className={`${backCampoClass}`}>
                                    <label className={`${titleClass}`}>Nome completo: *</label>
                                    <input required minLength={4}
                                        className={`${campoClass}`} type="text" min="4" max="16"
                                        placeholder="Ex.: Marcos da Silva Santos"
                                        value={newRegister.nome_completo}
                                        onChange={e => setNewRegister({ ...newRegister, nome_completo: e.target.value })} />
                                </div>
                                <div className={`${backCampoClass}`}>
                                    <label className={`${titleClass}`}>E-mail: *</label>
                                    <input required
                                        className={`${campoClass}`} type="email" minLength={4}
                                        pattern="^[a-z0-9.\-]+@[a-z0-9\-]+\.[a-z]{2,8}(\.[a-z]{2,8})?$"
                                        placeholder="Ex.: marcosdasilvasantos@gmail.com"
                                        value={newRegister.email}
                                        onChange={e => setNewRegister({ ...newRegister, email: e.target.value })} />
                                </div>
                                <div className="flex max-[610px]:flex-col">
                                    <div className={`${backCampoClass} w-1/2 max-[610px]:w-full`}>
                                        <label className={`${titleClass}`}>Senha: *</label>
                                        <input required className={`${campoClass}`}
                                            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                                            type="password" minLength={8} maxLength={20} placeholder="Uma senha forte com números, letras e ao menos um símbolo."
                                            value={newRegister.senha}
                                            onChange={e => setNewRegister({ ...newRegister, senha: e.target.value })} />
                                    </div>
                                    <p className="text-[12px] p-5 max-[610px]:p-0">Obs.:<br />
                                        Deve conter ao menos 8 dígitos, e no máximo 20, incluindo uma letra maiúscula, uma minúscula e um número;
                                    </p>
                                </div>
                                <div className="flex items-center justify-center pt-7.5">
                                    <button className={`w-42 cursor-pointer py-2.5 bg-orange-combat hover:bg-white hover:text-orange-combat font-bold transition-all uppercase text-sm ${isSending ? 'opacity-50' : ''}`}
                                        type="submit">{isSending ? 'Cadastrando novo usuário...' : 'Cadastrar'}</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div >
        </>
    )
}