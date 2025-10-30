import { HttpBaseRepository } from './http-base.repository';
import { ApiResponse } from '../interfaces/api.interface';

/**
 * Example API repository that extends the base HTTP repository
 */
export class ExampleApiRepository extends HttpBaseRepository {
  // constructor() {
  //   super({
  //     // You can override default config here if needed
  //     // baseUrl: 'https://api.different-domain.com',
  //     // headers: { 'X-Custom-Header': 'value' },
  //   });
  // }

  /**
   * Get a list of items from the API
   * @param page Optional page number for pagination
   * @param limit Optional limit of items per page
   * @returns Promise with the response data
   */
  async getItems<T>(page: number = 1, limit: number = 10): Promise<ApiResponse<T>> {
    return this.get<ApiResponse<T>>('items', { page, limit });
  }

  /**
   * Get a single item by ID
   * @param id Item ID
   * @returns Promise with the item data
   */
  async getItemById<T>(id: string): Promise<T> {
    return this.get<T>(`items/${id}`);
  }

  /**
   * Create a new item
   * @param data Item data
   * @returns Promise with the created item
   */
  async createItem<T>(data: any): Promise<T> {
    return this.post<T>('items', data);
  }

  /**
   * Update an existing item
   * @param id Item ID
   * @param data Updated item data
   * @returns Promise with the updated item
   */
  async updateItem<T>(id: string, data: any): Promise<T> {
    return this.put<T>(`items/${id}`, data);
  }

  /**
   * Partially update an item
   * @param id Item ID
   * @param data Partial item data
   * @returns Promise with the updated item
   */
  async patchItem<T>(id: string, data: any): Promise<T> {
    return this.patch<T>(`items/${id}`, data);
  }

  /**
   * Delete an item
   * @param id Item ID
   * @returns Promise with the deletion result
   */
  async deleteItem<T>(id: string): Promise<T> {
    return this.delete<T>(`items/${id}`);
  }
}
