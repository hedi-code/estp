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

  constructor(private cookieService: AuthCookieService) {

  }
  ngOnInit() {
    if (this.cookieService.getRole() !== "user" && this.cookieService.getRole() !== "rescommu" && this.cookieService.getRole() !== "comman") {
      this.model.push(
        {
          label: 'Tableau de Bord',
          items: [
          ]
        },
      )
      if (this.cookieService.getRole() === "pres" || this.cookieService.getRole() === "tres" || this.cookieService.getRole() === "comm") {
        this.model.find(i => i.label == "Tableau de Bord")?.items?.push({ label: 'Dashboard', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/forum/dashboard'] },
        )
      }
    }
    this.model.push({
      label: 'Gestion',
      items: []
    });
    if (this.cookieService.getRole() === "pres") {
      this.model.push(
        {
          label: 'Administration',
          items: [
            {
              label: 'BC1', icon: 'pi pi-fw pi-id-card', routerLink: ['/forum/gestion-bc1']
            },
            {
              label: 'BC2', icon: 'pi pi-fw pi-id-card', routerLink: ['/forum/gestion-bc2'],
            },
            {
              label: 'Standiste', icon: 'pi pi-fw pi-users', routerLink: ['/forum/standiste']
            },
            {
              label: 'Exposants', icon: 'pi pi-fw pi-user', routerLink: ['/forum/gestion-exposants']
            },

          ]
        }
      )

    }
    if (this.cookieService.getRole() === "rescom" || this.cookieService.getRole() === "pres" || this.cookieService.getRole() === "comm" || this.cookieService.getRole() === "tres") {
      const gestionIndex = this.model.findIndex(element => element.label === "Gestion");
      if (gestionIndex !== -1) {
        this.model[gestionIndex].items?.push(
          { label: 'Entreprises', icon: 'pi pi-fw pi-id-card', routerLink: ['/forum/entreprise'] },
        )
        this.model[gestionIndex].items?.push(
          { label: 'BC1', icon: 'pi pi-fw pi-check-square', routerLink: ['/forum/bc1'] },
        )
        this.model[gestionIndex].items?.push(
          { label: 'BC2', icon: 'pi pi-fw pi-mobile', class: 'rotated-icon', routerLink: ['/forum/bc2'] },
        )
      }
    }
     if (this.cookieService.getRole() === "rescommu" || this.cookieService.getRole() === "comman" || this.cookieService.getRole() === "pres" || this.cookieService.getRole() === "rescom") {
          const gestionIndex = this.model.findIndex(element => element.label === "Gestion");
          this.model[gestionIndex].items?.push({
            label: 'Mailing', icon: 'pi pi-fw pi-envelope', routerLink: ['/forum/mailing']
          },)

        }
    if (this.cookieService.getRole() === "resbook" || this.cookieService.getRole() === "pres") {
      const gestionIndex = this.model.findIndex(element => element.label === "Gestion");
      if (gestionIndex !== -1) {
        this.model[gestionIndex].items?.push(
          { label: 'Book', icon: 'pi pi-fw pi-mobile', class: 'rotated-icon', routerLink: ['/forum/gestion-book'] },
        )
      }
    }
    if (this.cookieService.getRole() === "resplan" || this.cookieService.getRole() === "pres") {
      const gestionIndex = this.model.findIndex(element => element.label === "Gestion");
      if (gestionIndex !== -1) {
        this.model[gestionIndex].items?.push(
          { label: 'Plan', icon: 'pi pi-fw pi-map', routerLink: ['/forum/gestion-plan'] },
        )
      }
    }
  }
}
