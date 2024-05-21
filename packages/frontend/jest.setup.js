import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

require('dotenv').config({ path: '.env.test' });