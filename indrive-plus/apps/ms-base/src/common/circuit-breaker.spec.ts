import { CircuitBreaker } from './circuit-breaker';

describe('CircuitBreaker', () => {
  it('devuelve el resultado cuando la acción tiene éxito', async () => {
    const breaker = new CircuitBreaker(3, 1000);
    const result = await breaker.execute(
      () => Promise.resolve('ok'),
      () => 'fallback',
    );
    expect(result).toBe('ok');
  });

  it('usa el fallback cuando la acción falla', async () => {
    const breaker = new CircuitBreaker(3, 1000);
    const result = await breaker.execute(
      () => Promise.reject(new Error('caída')),
      () => 'fallback',
    );
    expect(result).toBe('fallback');
  });

  it('abre el circuito tras el umbral y deja de invocar la acción', async () => {
    const breaker = new CircuitBreaker(2, 60000);
    const action = jest.fn().mockRejectedValue(new Error('caída'));
    const fallback = () => 'fallback';

    await breaker.execute(action, fallback);
    await breaker.execute(action, fallback);
    await breaker.execute(action, fallback);

    expect(action).toHaveBeenCalledTimes(2);
  });
});
