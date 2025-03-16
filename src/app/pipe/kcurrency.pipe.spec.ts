import { KcurrencyPipe } from './kcurrency.pipe';

describe('KcurrencyPipe', () => {
  it('create an instance', () => {
    const pipe = new KcurrencyPipe();
    expect(pipe).toBeTruthy();
  });
});
