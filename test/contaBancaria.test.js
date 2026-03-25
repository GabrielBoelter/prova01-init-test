const ContaBancaria = require('../src/contaBancaria');

describe('Suíte de Testes: Conta Bancária (100% Coverage)', () => {
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

  describe('Getters e Consultas', () => {
    test('Deve validar todos os métodos de leitura (Getters)', () => {
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

  describe('Movimentações (Depósito e Saque)', () => {
    test('Deve processar depósitos corretamente', () => {
      expect(conta.depositar(100)).toBe(true);
      expect(conta.depositar(0)).toBe(false); 
      expect(conta.depositar(-50)).toBe(false);
    });

    test('Deve processar saques dentro e fora do limite', () => {
      expect(conta.sacar(2447)).toBe(true); 
      expect(conta.sacar(1)).toBe(false);    
      expect(conta.sacar(-10)).toBe(false); 
      expect(conta.podeSacar(100)).toBe(false); 
    });
  });

  describe('Gestão de Status e Dados', () => {
    test('Deve gerenciar Bloqueio e Ativação', () => {
      expect(conta.bloquearConta()).toBe(true);
      expect(conta.bloquearConta()).toBe(false); 
      expect(conta.ativarConta()).toBe(true);
      expect(conta.ativarConta()).toBe(false); 
    });

    test('Deve gerenciar Encerramento de Conta', () => {
      expect(conta.encerrarConta()).toBe(false); 
      conta.sacar(1947);
      expect(conta.encerrarConta()).toBe(true);
    });

    test('Deve alterar titular e ajustar limites', () => {
      expect(conta.alterarTitular('Novo Nome')).toBe(true);
      expect(conta.alterarTitular('')).toBe(false);
      expect(conta.ajustarLimite(1000)).toBe(true);
      expect(conta.ajustarLimite(-10)).toBe(false);
    });
  });

  describe('Operações de Transferência e utilitários', () => {
    test('Deve transferir valores com sucesso', () => {
      const destino = new ContaBancaria({ saldo: 0 });
      expect(conta.transferir(100, destino)).toBe(true);
    });

    test('Não deve transferir se não houver saldo', () => {
      const destino = new ContaBancaria({ saldo: 0 });
      expect(conta.transferir(5000, destino)).toBe(false);
    });

    test('Deve cobrir falha crítica no saque durante transferência', () => {
      const destino = new ContaBancaria({ saldo: 0 });
      const originalSacar = conta.sacar;
      conta.sacar = () => false; 
      expect(conta.transferir(100, destino)).toBe(false);
      conta.sacar = originalSacar; 
    });

    test('Deve aplicar tarifas e resetar conta', () => {
      expect(conta.aplicarTarifa(10)).toBe(true);
      expect(conta.aplicarTarifa(-1)).toBe(false);
      conta.resetarConta();
      expect(conta.obterSaldo()).toBe(0);
    });
  });

  describe('Validação e Resumo', () => {
    test('Deve validar todos os campos da conta (validarConta)', () => {
      expect(conta.validarConta()).toBe(true);
      
      const originalID = conta.conta.id;
      conta.conta.id = null;
      expect(conta.validarConta()).toBe(false);
      conta.conta.id = originalID;

      conta.conta.titular = "";
      expect(conta.validarConta()).toBe(false);
      conta.conta.titular = "Gabriel";

      conta.conta.saldo = "texto";
      expect(conta.validarConta()).toBe(false);
      conta.conta.saldo = 0;

      conta.conta.limite = -1;
      expect(conta.validarConta()).toBe(false);
      conta.conta.limite = 0;

      conta.conta.status = "desconhecido";
      expect(conta.validarConta()).toBe(false);
    });

    test('Deve gerar o resumo da conta corretamente', () => {
      const resumo = conta.gerarResumo();
      expect(resumo.titular).toBe('Gabriel Custodio Boelter');
      expect(resumo.disponivel).toBe(2447);
    });
  });
});
