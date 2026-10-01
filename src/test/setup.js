import '@testing-library/jest-dom/vitest';

/**
 * O ambiente de teste (jsdom 30 no Node 26) não expõe localStorage: o global do
 * Node existe mas fica indefinido sem a flag --localstorage-file e ofusca o do
 * jsdom. Com isso, as preferências locais (moeda, notificações) caíam no catch
 * e o código de persistência nunca era exercitado.
 */
class LocalStorageMemoria {
  #dados = new Map();

  get length() {
    return this.#dados.size;
  }

  key(indice) {
    return [...this.#dados.keys()][indice] ?? null;
  }

  getItem(chave) {
    const k = String(chave);
    return this.#dados.has(k) ? this.#dados.get(k) : null;
  }

  setItem(chave, valor) {
    this.#dados.set(String(chave), String(valor));
  }

  removeItem(chave) {
    this.#dados.delete(String(chave));
  }

  clear() {
    this.#dados.clear();
  }
}

if (!globalThis.localStorage) {
  const memoria = new LocalStorageMemoria();
  globalThis.localStorage = memoria;

  if (typeof window !== 'undefined' && !window.localStorage) {
    try {
      Object.defineProperty(window, 'localStorage', {
        value: memoria,
        configurable: true,
      });
    } catch (error) {
      console.warn('Não foi possível instalar o localStorage de teste:', error);
    }
  }
}
