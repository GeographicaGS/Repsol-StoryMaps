import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpHeaders } from '@angular/common/http';
import { AuthenticationService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private auth: AuthenticationService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    const userData = this.auth.getUser();
    if (userData && userData.token) {
      request = request.clone({setHeaders: { Authorization: userData.token }});
    }
    return next.handle(request);
  }
}
