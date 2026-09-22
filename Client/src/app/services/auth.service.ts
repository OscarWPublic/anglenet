import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface AuthResponse {
	token: string;
	user: { id: number; username: string; };
}

interface AuthUser {
	id: number;
	username: string;
}

export interface RegisterRequest {
	username: string;
	password: string;
}

@Injectable({
  	providedIn: 'root'
})
export class AuthService {
	private http = inject(HttpClient);
	private apiUrl = `${environment.apiUrl}`;

	private user = signal<AuthUser | null>(this.getStoredUser())
	readonly currentUser = this.user.asReadonly();

	register(credentials: { username: string; password: string }): Observable<AuthResponse> {
		return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, credentials)
			.pipe(tap(response => this.setSession(response)));
	}

	login(credentials: { username: string; password: string }): Observable<AuthResponse> {
		return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
			.pipe(tap(response => this.setSession(response)));
	}

	logout() {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		this.user.set(null);
	}
	
	private setSession(response: AuthResponse) {
		localStorage.setItem('token', response.token);
		localStorage.setItem('user', JSON.stringify(response.user));
		this.user.set(response.user);
	}
	private getStoredUser(): AuthUser | null {
		const user = localStorage.getItem('user');
		return user ? JSON.parse(user) : null;
	}

	getToken(): string | null {
		return localStorage.getItem('token');
	}

	getUser() {
		const user = localStorage.getItem('user');
		return user ? JSON.parse(user) : null;
	}

	isLoggedIn(): boolean {
		return this.getToken() !== null;
	}
}