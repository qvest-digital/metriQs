// src/app/services/auth.service.ts
import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Router} from '@angular/router';
import {StorageService} from './storage.service';
// import {environment} from "../../environments/environment";
import {firstValueFrom} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  // private authUrl = 'https://auth.atlassian.com/authorize';
  //

  constructor(private http: HttpClient, private router: Router, private databaseService: StorageService) {}

  randomString(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }




}
