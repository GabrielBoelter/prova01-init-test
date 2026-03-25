const Pessoa = require("../src/pessoa");

describe("Pessoa", () => {
	let pessoa;

	beforeEach(() => {
		pessoa = new Pessoa("Arthur", 30);
	});

	test("deve criar uma instância de Pessoa com nome e idade corretos", () => {
		expect(pessoa.nome).toBe("Arthur");
		expect(pessoa.idade).toBe(30);
	});

	test("apresentar deve retornar a string formatada corretamente", () => {
		const mensagem = pessoa.apresentar();
		expect(mensagem).toBe("Olá, meu nome é Arthur e eu tenho 30 anos.");
	});

	test("atualizarIdade deve alterar a idade da pessoa", () => {
		pessoa.atualizarIdade(35);
		expect(pessoa.idade).toBe(35);
	});
});
