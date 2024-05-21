import { loader } from './user.$id';
import { Request } from 'node-fetch';

describe('loader function', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('returns user data when the response is ok', async () => {
    const mockData = { firstName: 'John', lastName: 'Doe' };

    fetchMock.mockResponseOnce(JSON.stringify(mockData));

    const result = await loader({ params: { id: '1' }, request: new Request('') });

    expect(result).toEqual(mockData);
  });

  it('returns a 404 response when the user is not found', async () => {
    fetchMock.mockResponseOnce('', { status: 404 });

    try {
      await loader({ params: { id: '1' }, request: new Request('') });
    } catch (error) {
      expect(error.status).toEqual(404);
      expect(error.statusText).toEqual('Not Found');
    }
  });
});