import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-menu',
  standalone: false,
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  model: MenuItem[] = [];

  ngOnInit() {
    this.model = [
      {
        label: 'Gestion',
        items: [
          { label: 'Entreprises', icon: 'pi pi-fw pi-id-card', routerLink: ['/forum/entreprise'] },
          { label: 'BC1', icon: 'pi pi-fw pi-check-square', routerLink: ['/forum/bc1'] },
          // { label: 'BC2', icon: 'pi pi-fw pi-mobile', class: 'rotated-icon', routerLink: ['/forum/bc2'] },
          // { label: 'Fiche signaletique', icon: 'pi pi-fw pi-table', routerLink: ['/uikit/table'] },
          // { label: 'Exposants', icon: 'pi pi-fw pi-list', routerLink: ['/uikit/list'] },
          // { label: 'Pancartes', icon: 'pi pi-fw pi-share-alt', routerLink: ['/uikit/tree'] },
          // { label: 'Utilisateurs', icon: 'pi pi-fw pi-tablet', routerLink: ['/uikit/panel'] },
          // { label: 'Dashboard', icon: 'pi pi-fw pi-clone', routerLink: ['/uikit/overlay'] },
          // { label: 'Standiste', icon: 'pi pi-fw pi-image', routerLink: ['/uikit/media'] },
        ]
      },
      // {
      //   label: 'Administration',
      //   items: [
      //     {
      //       label: 'BC1', icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout'],
      //       items: [
      //         {
      //           label: 'Packs',
      //           icon: 'pi pi-fw pi-globe',
      //           routerLink: ['/landing']
      //         },
      //         {
      //           label: 'Options',
      //           icon: 'pi pi-fw pi-globe',
      //           routerLink: ['/landing']
      //         }
      //       ]
      //     },
      //     {
      //       label: 'BC2', icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout'],
      //       items: [
      //         {
      //           label: 'Packs',
      //           icon: 'pi pi-fw pi-globe',
      //           routerLink: ['/landing']
      //         },
      //         {
      //           label: 'Options',
      //           icon: 'pi pi-fw pi-globe',
      //           routerLink: ['/landing']
      //         },
      //         {
      //           label: 'Catégorie d\'options',
      //           icon: 'pi pi-fw pi-globe',
      //           routerLink: ['/landing']
      //         }
      //       ]
      //     },
      //     {
      //       label: 'Autre', icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout'],
      //       items: [
      //         {
      //           label: 'Secteurs d\'activité',
      //           icon: 'pi pi-fw pi-globe',
      //           routerLink: ['/landing']
      //         },
      //         {
      //           label: 'Paramétres',
      //           icon: 'pi pi-fw pi-globe',
      //           routerLink: ['/landing']
      //         }
      //       ]
      //     },

      //   ]
      // },



    ];
  }
}
