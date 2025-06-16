import { Component } from '@angular/core';
import { LayoutService } from '../services/layout.service';
import { AuthCookieService } from '../../../core/services/auth-cookie.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  nom: string =''

  constructor(public layoutService:LayoutService, private authCookieService: AuthCookieService, private router:Router){}
ngOnInit(){
      this.nom = this.authCookieService.getFirstName() + " " + this.authCookieService.getLastName();
}
  logout(){
    this.authCookieService.logout()
    this.router.navigateByUrl('');
  }
}
