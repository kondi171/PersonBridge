import { Injectable } from '@angular/core';
import { environment } from '../app.environment';

@Injectable({
  providedIn: 'root'
})
export class GetUserService {

  constructor() { }

  getUser(id: string) {
    return fetch(`${environment.apiUrl}/user/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Internal Server Error');
        }
        return response.json();
      })
      .then(data => {
        return data;
      })
      .catch(error => {
        console.error('Internal Server Error:', error);
        throw error;
      });
  }
}
