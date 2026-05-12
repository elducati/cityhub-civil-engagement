/**
 * API Test Client
 * Wraps Supertest with pre-authenticated request builders
 */

import request, { SuperTest, Test } from 'supertest';
import { fixtures } from '../fixtures/identities';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

class ApiClient {
  private token: string | null = null;

  private async request(method: HttpMethod, path: string): Promise<Test> {
    const req = request(API_BASE_URL)[method](path);
    if (this.token) {
      req.set('Authorization', `Bearer ${this.token}`);
    }
    return req;
  }

  /**
   * No Authorization header - for testing unauthenticated routes
   */
  asGuest(): Pick<ApiClient, 'get' | 'post' | 'put' | 'patch' | 'delete'> {
    const client = new ApiClient();
    return {
      get: (path: string) => client.request('get', path),
      post: (path: string) => client.request('post', path),
      put: (path: string) => client.request('put', path),
      patch: (path: string) => client.request('patch', path),
      delete: (path: string) => client.request('delete', path),
    };
  }

  /**
   * Bearer token for fixtures.users.citizen
   */
  asCitizen(): Pick<ApiClient, 'get' | 'post' | 'put' | 'patch' | 'delete'> {
    const client = new ApiClient();
    client.token = fixtures.tokens.citizen();
    return {
      get: (path: string) => client.request('get', path),
      post: (path: string) => client.request('post', path),
      put: (path: string) => client.request('put', path),
      patch: (path: string) => client.request('patch', path),
      delete: (path: string) => client.request('delete', path),
    };
  }

  /**
   * Bearer token for fixtures.users.moderator
   */
  asModerator(): Pick<ApiClient, 'get' | 'post' | 'put' | 'patch' | 'delete'> {
    const client = new ApiClient();
    client.token = fixtures.tokens.moderator();
    return {
      get: (path: string) => client.request('get', path),
      post: (path: string) => client.request('post', path),
      put: (path: string) => client.request('put', path),
      patch: (path: string) => client.request('patch', path),
      delete: (path: string) => client.request('delete', path),
    };
  }

  /**
   * Bearer token for fixtures.users.admin
   */
  asAdmin(): Pick<ApiClient, 'get' | 'post' | 'put' | 'patch' | 'delete'> {
    const client = new ApiClient();
    client.token = fixtures.tokens.admin();
    return {
      get: (path: string) => client.request('get', path),
      post: (path: string) => client.request('post', path),
      put: (path: string) => client.request('put', path),
      patch: (path: string) => client.request('patch', path),
      delete: (path: string) => client.request('delete', path),
    };
  }

  /**
   * Custom bearer token (for tamper tests)
   */
  withToken(token: string): Pick<ApiClient, 'get' | 'post' | 'put' | 'patch' | 'delete'> {
    const client = new ApiClient();
    client.token = token;
    return {
      get: (path: string) => client.request('get', path),
      post: (path: string) => client.request('post', path),
      put: (path: string) => client.request('put', path),
      patch: (path: string) => client.request('patch', path),
      delete: (path: string) => client.request('delete', path),
    };
  }
}

export const api = {
  asGuest: () => new ApiClient().asGuest(),
  asCitizen: () => new ApiClient().asCitizen(),
  asModerator: () => new ApiClient().asModerator(),
  asAdmin: () => new ApiClient().asAdmin(),
  withToken: (token: string) => new ApiClient().withToken(token),
};