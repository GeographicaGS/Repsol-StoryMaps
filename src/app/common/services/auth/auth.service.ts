import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Md5 } from 'ts-md5/dist/md5';

@Injectable()
export class AuthenticationService {

  data;
  _renewGapSeconds = 200;
  interval: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    if (this.isLoggedIn()) {
      this.data = this.getUser();
      this.setRenewer();
    }
  }

  login(username: string, password: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'x-auth-username':  username,
        'x-auth-password': <string>Md5.hashStr(password)
      })
    };
    return this.http.get(`${environment.api}/auth/token`, httpOptions).map((response: Response) => {
      return this.initUser(response);
    });
  }

  renew() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization':  this.getUser().token,
      })
    };

    this.http.get(`${environment.api}/auth/token/renew`, httpOptions)
        .subscribe(
          (res) => {
            return this.initUser(res);
          },
          (error) => {
            this.router.navigate(['/login']);
          }
        );
  }

  initUser(response) {
    const user = <any>response;
    if (user && user.token) {
      this.data = user;
      this.setUser();
      this.setRenewer();
    }
    return user;
  }

  getUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  setUser()  {
    this.data.expires = new Date().getTime() + (this.data.expires_in) * 1000;
    localStorage.setItem('currentUser', JSON.stringify(this.data));
  }

  setRenewer() {
    const diff = <any>new Date(this.data.expires) - <any>new Date();
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = setTimeout(() => {
      this.renew();
    }, diff - this._renewGapSeconds * 1000);
  }

  isLoggedIn() {
    const data = this.getUser();
    if (!data) {
      return false;
    }
    return (<any>new Date(data.expires) - <any>new Date()) > 0;
  }

  logout() {
    localStorage.removeItem('currentUser');
  }
}
