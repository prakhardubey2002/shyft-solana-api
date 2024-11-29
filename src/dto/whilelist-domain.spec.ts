import { WhiteListDomainsDto } from './whitelist-domains.dto';

describe('testing while listing dto functions', () => {
  it('should return string array', () => {
    const urls = 'shyft.to,   shyter.to,,,   shfyt.com';
    const wh = new WhiteListDomainsDto();
    wh.domains = urls;
    const result = wh.getDomainList();
    console.log(result);
    expect(result.length).toBe(3);
  });

  it('should return string array', () => {
    const urls = '       shyft.to,   shyter.to,   shfyt.com';
    const wh = new WhiteListDomainsDto();
    wh.domains = urls;
    const result = wh.getDomainList();
    console.log(result);
    expect(result.length).toBe(3);
  });

  it('should return string array', () => {
    const urls = 'shyft.to, shyter.to, shfyt.com';
    const wh = new WhiteListDomainsDto();
    wh.domains = urls;
    const result = wh.getDomainList();
    console.log(result);
    expect(result.length).toBe(3);
  });
});
