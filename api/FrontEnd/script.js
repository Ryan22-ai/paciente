const API_URL = "http://localhost:8080/api/pacientes";

class AnimacoesAnimeStyle {
    constructor() {
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.titulo = document.querySelector('.conteudo-cabecalho h1');
        this.cabecalho = document.querySelector('.cabecalho');
        this.mouse = { x: 0, y: 0 };
        this.mouseAlvo = { x: 0, y: 0 };
        this.loopAtivo = false;
    }

    iniciar() {
        if (this.reducedMotion) {
            this.aplicarEstadoEstatico();
            return;
        }

        this.animarTituloAnimeJS();
        this.animarInterfaceInicial();
        this.configurarMouse3d();
    }

    animarTituloAnimeJS() {
        if (!this.titulo) return;

        this.titulo.style.transformStyle = "preserve-3d";

        anime({
            targets: this.titulo,
            opacity: [0, 1],
            translateY: [60, 0],
            rotateX: [70, -10],
            rotateY: [-40, 10],
            scale: [0.7, 1.05, 1],
            easing: "easeOutExpo",
            duration: 1400
        });
    }

    animarInterfaceInicial() {
        anime({
            targets: '.cabecalho',
            opacity: [0, 1],
            translateY: [-30, 0],
            duration: 900,
            easing: 'easeOutExpo'
        });

        anime({
            targets: '.secao-formulario, .secao-tabela',
            opacity: [0, 1],
            translateY: [50, 0],
            delay: anime.stagger(150),
            duration: 900
        });
    }

    animarLinhasTabela() {
        anime({
            targets: '.tabela-linha',
            opacity: [0, 1],
            translateY: [15, 0],
            duration: 400
        });
    }

    animarMensagem(el) {
        anime({
            targets: el,
            opacity: [0, 1],
            translateY: [-10, 0],
            duration: 300
        });
    }

    aplicarEstadoEstatico() {
        if (this.titulo) {
            this.titulo.style.transform = "rotateX(10deg) rotateY(-10deg)";
        }
    }
}

// ================== GERENCIADOR ==================

class GerenciadorPacientes {
    constructor() {
        this.pacientes = [];
        this.pacientesFiltrados = [];

        this.formulario = document.getElementById('formularioPaciente');
        this.tabelaPacientes = document.getElementById('tabelaPacientes');
        this.mensagem = document.getElementById('mensagem');
        this.contador = document.getElementById('contador');

        this.currentPage = 1;
        this.pageSize = 8;

        this.buscaInput = document.getElementById('buscaNome');
        this.infoPagina = document.getElementById('infoPagina');
        this.prevBtn = document.getElementById('prevPage');
        this.nextBtn = document.getElementById('nextPage');

        this.animacoes = new AnimacoesAnimeStyle();

        this.inicializar();
    }

    inicializar() {
        this.animacoes.iniciar();
        this.configurarEventos();
        this.carregarPacientes();
    }

    configurarEventos() {
        this.formulario?.addEventListener('submit', e => this.enviarFormulario(e));

        document.getElementById('cep')?.addEventListener('blur', () => this.buscarCep());

        this.buscaInput?.addEventListener('input', () => {
            this.currentPage = 1;
            this.renderizarTabela();
        });

        this.prevBtn?.addEventListener('click', () => this.irPaginaAnterior());
        this.nextBtn?.addEventListener('click', () => this.irPaginaProxima());
    }

    async carregarPacientes() {
        try {
            const res = await fetch(API_URL);
            this.pacientes = await res.json();
            this.pacientesFiltrados = [...this.pacientes];
            this.renderizarTabela();
        } catch {
            this.exibirMensagem("Erro ao carregar pacientes", "erro");
        }
    }

    filtrarPacientes() {
        const termo = this.buscaInput?.value.toLowerCase().trim() || "";

        this.pacientesFiltrados = termo
            ? this.pacientes.filter(p => p.nome?.toLowerCase().includes(termo))
            : [...this.pacientes];
    }

    obterPacientesPagina() {
        const ini = (this.currentPage - 1) * this.pageSize;
        return this.pacientesFiltrados.slice(ini, ini + this.pageSize);
    }

    atualizarControlesPaginacao() {
        const totalPaginas = Math.max(1, Math.ceil(this.pacientesFiltrados.length / this.pageSize));

        this.infoPagina.textContent = `Página ${this.currentPage} de ${totalPaginas}`;

        this.prevBtn.disabled = this.currentPage <= 1;
        this.nextBtn.disabled = this.currentPage >= totalPaginas;
    }

    irPaginaAnterior() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderizarTabela();
        }
    }

    irPaginaProxima() {
        const totalPaginas = Math.ceil(this.pacientesFiltrados.length / this.pageSize);
        if (this.currentPage < totalPaginas) {
            this.currentPage++;
            this.renderizarTabela();
        }
    }

    // ================= CONTADOR CORRIGIDO =================
    atualizarContador() {
        if (!this.contador) return;

        const total = this.pacientes.length;
        const filtrados = this.pacientesFiltrados.length;
        const palavra = filtrados === 1 ? "paciente" : "pacientes";

        if (filtrados === total) {
            this.contador.textContent = `${total} ${palavra}`;
        } else {
            this.contador.textContent = `${filtrados} de ${total} ${palavra}`;
        }
    }

    // ================= PDF CORRIGIDO =================
    async gerarRelatorioPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const data = new Date().toLocaleDateString('pt-BR');

        doc.setFontSize(16);
        doc.text("Relatório de Pacientes", 105, 20, { align: "center" });

        doc.setFontSize(10);
        doc.text(`Gerado em: ${data}`, 105, 28, { align: "center" });

        doc.line(15, 35, 195, 35);

        const headers = ["Nome", "CPF", "Telefone", "Cidade/UF", "CEP"];
        const x = [15, 55, 95, 140, 175];
        const widths = [35, 35, 40, 30, 20];

        let y = 45;

        doc.setFontSize(9);

        doc.setFillColor(79, 70, 229);
        doc.setTextColor(255);
        doc.rect(15, y - 6, 180, 8, 'F');

        headers.forEach((h, i) => doc.text(h, x[i], y));

        doc.setTextColor(0);
        y += 10;

        const dados = this.pacientesFiltrados.map(p => [
            p.nome || "",
            this.formatarCpf(p.cpf || ""),
            this.formatarTelefone(p.telefone || ""),
            `${p.cidade || ""} - ${p.estado || ""}`,
            this.formatarCep(p.cep || "")
        ]);

        dados.forEach((linha, i) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }

            if (i % 2 === 0) {
                doc.setFillColor(245, 245, 245);
                doc.rect(15, y - 5, 180, 8, 'F');
            }

            linha.forEach((txt, j) => {
                const safe = doc.splitTextToSize(String(txt), widths[j]);
                doc.text(safe, x[j], y);
            });

            y += 10;
        });

        doc.text("Sistema Clínica Médica", 105, 285, { align: "center" });

        doc.save(`pacientes_${data.replace(/\//g, '-')}.pdf`);
        this.exibirMensagem("PDF gerado!", "sucesso");
    }

    renderizarTabela() {
        this.filtrarPacientes();

        const page = this.obterPacientesPagina();

        if (!page.length) {
            this.tabelaPacientes.innerHTML = "<div class='tabela-vazia'>Nenhum paciente</div>";
            this.atualizarContador();
            return;
        }

        let html = "";

        page.forEach(p => {
            html += `
            <div class="tabela-linha">
                <div>${p.nome}</div>
                <div>${this.formatarCpf(p.cpf)}</div>
                <div>${p.cidade} - ${p.estado}</div>
                <div>${this.formatarTelefone(p.telefone)}</div>
                <div>
                    <button class="botao-editar" onclick="gerenciador.editarPaciente(${p.id})">Editar</button>
                    <button class="botao-deletar" onclick="gerenciador.deletarPaciente(${p.id})">Deletar</button>
                </div>
            </div>`;
        });

        this.tabelaPacientes.innerHTML = html;

        this.atualizarContador();
        this.atualizarControlesPaginacao();
        this.animacoes.animarLinhasTabela();
    }

    exibirMensagem(msg, tipo) {
        this.mensagem.textContent = msg;
        this.mensagem.className = `mensagem ${tipo}`;
        setTimeout(() => this.mensagem.className = "mensagem", 3000);
    }

    formatarCpf(v) {
        return v.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    formatarTelefone(v) {
        const n = v.replace(/\D/g, "");
        return n.length === 11
            ? n.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
            : v;
    }

    formatarCep(v) {
        return v.replace(/\D/g, "").replace(/(\d{5})(\d{3})/, "$1-$2");
    }
}

// INIT
let gerenciador;

function iniciar() {
    gerenciador = new GerenciadorPacientes();
    window.gerenciador = gerenciador;
}

document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", iniciar)
    : iniciar();