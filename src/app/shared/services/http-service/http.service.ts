import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private apiUrl = 'https://example.com/api'; // replace with your API url

  constructor(private http: HttpClient) { }

  private getToken(): string | null {
      const cookies = document.cookie?.split('; ');
      const jwtCookie = cookies?.find(row => row.startsWith('jwt='));
      return jwtCookie ? jwtCookie.split('=')[1] : null;
    }
    

  private setToken(token: string): void {
    const now = new Date();
    const expiryTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    document.cookie = `jwt=${token}; expires=${expiryTime.toUTCString()}; path=/`;
  }

  private handleError(error: HttpErrorResponse) {
    console.error(error);
    
    let errorMessage = 'Something went wrong. Please try again later.';
    
    if (error.status === 0) {
      errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
    } else if (error.status === 400) {
      errorMessage = 'Bad request. Please check your request and try again.';
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized request. Please login and try again.';
    } else if (error.status === 403) {
      errorMessage = 'Forbidden request. You do not have permission to access this resource.';
    } else if (error.status === 404) {
      errorMessage = 'Resource not found. Please check the URL and try again.';
    } else if (error.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    }
    
    return throwError(errorMessage);
  }


  private getRequestHeaders() {
    const token = this.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  get(endpoint: string, params?: any) {
    const headers = this.getRequestHeaders();
    return this.http.get(`${this.apiUrl}/${endpoint}`, { headers, params }).pipe(
      catchError(this.handleError),
    );
  }

  post(endpoint: string, data: any) {
    const headers = this.getRequestHeaders();
    return this.http.post(`${this.apiUrl}/${endpoint}`, data, { headers }).pipe(
      map((response: any) => {
        this.setToken(response.jwt); // save the token in cookies
        return response;
      }),
      catchError(this.handleError),
    );
  }

  put(endpoint: string, data: any) {
    const headers = this.getRequestHeaders();
    return this.http.put(`${this.apiUrl}/${endpoint}`, data, { headers }).pipe(
      catchError(this.handleError),
    );
  }

  delete(endpoint: string) {
    const headers = this.getRequestHeaders();
    return this.http.delete(`${this.apiUrl}/${endpoint}`, { headers }).pipe(
      catchError(this.handleError),
    );
  }
}
