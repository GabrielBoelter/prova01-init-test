const ContaBancaria = require('../src/contaBancaria');

describe('Suíte de Testes: Conta Bancária', () => {
  let dadosIniciais;
  let conta;

  beforeEach(() => {
    dadosIniciais = {
      id: 1,
      titular: 'Gabriel Custodio Boelter',
      saldo: 1947,
      limite: 500,
      status: 'ativa',
      atualizadaEm: new Date()
    };
    conta = new ContaBancaria(dadosIniciais);
  });

  describe('Consultas e Getters', () => {
    test('Deve validar todas as consultas básicas', () => {
      expect(conta.obterSaldo()).toBe(1947);
      expect(conta.obterTitular()).toBe('Gabriel Custodio Boelter');
      expect(conta.obterStatus()).toBe('ativa');
      expect(conta.obterLimite()).toBe(500);
      expect(conta.estaAtiva()).toBe(true);
      expect(conta.calcularSaldoDisponivel()).toBe(2447);
    });

    test('Deve verificar saldo negativo corretamente', () => {
      expect(conta.saldoNegativo()).toBe(false);
      conta.sacar(2000); 
      expect(conta.saldoNegativo()).toBe(true);
    });
  });

  describe('Movimentações e Regras de Negócio', () => {
    test('Depósitos: Sucesso e Falha', () => {
      expect(conta.depositar(100)).toBe(true);
      expect(conta.depositar(0)).toBe(false);
      expect(conta.depositar(-50)).toBe(false);
    });

    test('Saques: Limites e Validações', () => {
      expect(conta.sacar(2447)).toBe(true); // No limite exato
      expect(conta.sacar(1)).toBe(false);    // Sem saldo
      expect(conta.sacar(-10)).toBe(false);  // Valor inválido
      
      expect(conta.podeSacar(1000)).toBe(false); // Porque o saldo está negativo agora
    });

    test('Transferências: Sucesso e Falha de saldo', () => {
      const destino = new ContaBancaria({ saldo: 0, depositar: (v) => {} });
      expect(conta.transferir(100, destino)).toBe(true);
      expect(conta.transferir(5000, destino)).toBe(false); // Falha no podeSacar
    });
  });

  describe('Gestão de Status e Configurações', () => {
    test('Bloqueio, Ativação e Encerramento', () => {
      // Bloqueio
      expect(conta.bloquearConta()).toBe(true);
      expect(conta.bloquearConta()).toBe(false); // Já bloqueada
      
      // Ativação
      expect(conta.ativarConta()).toBe(true);
      expect(conta.ativarConta()).toBe(false); // Já ativa
      
      // Encerramento
      expect(conta.encerrarConta()).toBe(false); // Tem saldo
      conta.sacar(1947);
      expect(conta.encerrarConta()).toBe(true);
    });

    test('Ajustes de Limite e Titular', () => {
      expect(conta.ajustarLimite(1000)).toBe(true);
      expect(conta.ajustarLimite(-1)).toBe(false);
      expect(conta.alterarTitular('Novo Nome')).toBe(true);
      expect(conta.alterarTitular(null)).toBe(false);
    });
  });

  describe('Validações de Integridade (Aumenta muito a cobertura)', () => {
    test('Deve validar todos os critérios do método validarConta', () => {
      expect(conta.validarConta()).toBe(true);

      // Testando cada 'if' de erro do validarConta:
      conta.conta.id = null;
      expect(conta.validarConta()).toBe(false);
      
      conta.conta.id = 1; // restaura
      conta.conta.titular = "";
      expect(conta.validarConta()).toBe(false);
      
      conta.conta.titular = "Gabriel";
      conta.conta.saldo = "100"; // String em vez de Number
      expect(conta.validarConta()).toBe(false);
      
      conta.conta.saldo = 0;
      conta.conta.limite = -10;
      expect(conta.validarConta()).toBe(false);
      
      conta.conta.limite = 0;
      conta.conta.status = "invalido";
      expect(conta.validarConta()).toBe(false);
    });

    test('Deve aplicar tarifas e resetar conta', () => {
      expect(conta.aplicarTarifa(10)).toBe(true);
      expect(conta.aplicarTarifa(-10)).toBe(false);

      conta.resetarConta();
      expect(conta.obterSaldo()).toBe(0);
      expect(conta.obterStatus()).toBe('ativa');
    });

    test('Deve gerar resumo completo', () => {
      const resumo = conta.gerarResumo();
      expect(resumo).toEqual({
        titular: 'Gabriel Custodio Boelter',
        saldo: 1947,
        limite: 500,
        disponivel: 2447,
        status: 'ativa'
      });
    });
  });
});