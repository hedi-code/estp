import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';


@Injectable({
  providedIn: 'root'
})
export class AuthCookieService {

  constructor(private cookieService: CookieService) { }

  getToken(){
    return this.cookieService.get('token') || null;
  }
  getEmail(){
    return this.cookieService.get('email') || null;
  }
  getFirstName(){
    return this.cookieService.get('first_name') || null;
  }
  getLastName(){
    return this.cookieService.get('last_name') || null;
  }
  getPassword(){
    return this.cookieService.get('password') || null;
  }
  getUserId(){
    return this.cookieService.get('user_id') || null;
  }
  getContacPrincipaltId(){
    return this.cookieService.get('contact_principal_id') || null;
  }
  getEntrepriseId(){
    return this.cookieService.get('entreprise_id') || null;
  }
  getStep(){
    return this.cookieService.get('step') || null;
  }
  logout(){
    this.cookieService.deleteAll();
  }
}

