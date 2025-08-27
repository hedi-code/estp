import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthCookieService } from '../../../../core/services/auth-cookie.service';

@Component({
  selector: 'app-menu',
  standalone: false,
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  model: MenuItem[] = [];

  constructor(private cookieService: AuthCookieService){

  }
  ngOnInit() {
    this.model = [
      {
        label: 'Gestion',
        items: [
          // { label: 'Fiche signaletique', icon: 'pi pi-fw pi-table', routerLink: ['/uikit/table'] },
          // { label: 'Exposants', icon: 'pi pi-fw pi-list', routerLink: ['/uikit/list'] },
          // { label: 'Pancartes', icon: 'pi pi-fw pi-share-alt', routerLink: ['/uikit/tree'] },
          // { label: 'Utilisateurs', icon: 'pi pi-fw pi-tablet', routerLink: ['/uikit/panel'] },
          // { label: 'Dashboard', icon: 'pi pi-fw pi-clone', routerLink: ['/uikit/overlay'] },
          // { label: 'Standiste', icon: 'pi pi-fw pi-image', routerLink: ['/uikit/media'] },
        ]
      },
    ];
    if(this.cookieService.getRole() === "pres"){
      this.model.push(
         {
        label: 'Administration',
        items: [
          {
            label: 'BC1', icon: 'pi pi-fw pi-id-card', routerLink: ['/forum/gestion-bc1']},
          {
            label: 'BC2', icon: 'pi pi-fw pi-id-card', routerLink: ['/forum/gestion-bc2'],
          },

        ]
      }
      )
      
    }
    if(this.cookieService.getRole() === "rescom" ||this.cookieService.getRole() === "pres" || this.cookieService.getRole() === "comm" || this.cookieService.getRole() === "tres"){
      this.model[this.model.findIndex(element => element.label === "Gestion")].items?.push(
          { label: 'Entreprises', icon: 'pi pi-fw pi-id-card', routerLink: ['/forum/entreprise'] },
      )
      this.model[this.model.findIndex(element => element.label === "Gestion")].items?.push(
          { label: 'BC1', icon: 'pi pi-fw pi-check-square', routerLink: ['/forum/bc1'] },
      )
      this.model[this.model.findIndex(element => element.label === "Gestion")].items?.push(
          { label: 'BC2', icon: 'pi pi-fw pi-mobile', class: 'rotated-icon', routerLink: ['/forum/bc2'] },
      )
    }
     if(this.cookieService.getRole() === "resbook" ||this.cookieService.getRole() === "pres"){
      this.model[this.model.findIndex(element => element.label === "Gestion")].items?.push(
          { label: 'Book', icon: 'pi pi-fw pi-mobile', class: 'rotated-icon', routerLink: ['/forum/gestion-book'] },
      )
    }
  }
}
