import { Component, OnInit } from '@angular/core';
import { AuthCookieService } from '../../core/services/auth-cookie.service';
import { EntrepriseService } from './entreprise.service';
import { UserService } from '../forum/services/user.service';
import { Router } from '@angular/router';
import { Commande1Service } from '../forum/services/commande1.service';
import { Commande2Service } from '../forum/services/commande2.service';


@Component({
  selector: 'app-entreprise',
  standalone: false,
  templateUrl: './entreprise.component.html',
  styleUrl: './entreprise.component.scss'
})
export class EntrepriseComponent implements OnInit{
  active: number  = 0;
  nom: string =''
  step: number = 0

  constructor(private authCookieService: AuthCookieService, private entrepriseService: EntrepriseService, private userService: UserService, private router:Router, private bc1Service: Commande1Service, private bc2Service: Commande2Service){}

  ngOnInit(): void {
    this.entrepriseService.getEntrepriseByUserId().subscribe()
    this.nom = this.authCookieService.getFirstName() + " " + this.authCookieService.getLastName();
    this.step = Number(this.authCookieService.getStep())
    this.checkStep();
  }

  decrementStep() {
    console.log('Before decrement:', this.step);
    this.step = this.step - 1;
    console.log('After decrement:', this.step);
    this.userService.updateStep(Number(this.authCookieService.getUserId()),this.step).subscribe()
    
  }
  
  incrementStep() {
    console.log('Before increment:', this.step);
    this.step = this.step + 1;
    console.log('After increment:', this.step);
    this.userService.updateStep(Number(this.authCookieService.getUserId()),this.step).subscribe()
  }

  logout(){
    this.authCookieService.logout()
    this.router.navigateByUrl('');
  }
  async checkStep(){
    await this.bc1Service.getCommande1ByEntrepriseId(Number(this.authCookieService.getEntrepriseId())).subscribe({
      next: (response) => {
        if(response){
          this.step = 3
          this.userService.updateStep(Number(this.authCookieService.getUserId()),this.step).subscribe()

        }
      }
    })
    await this.bc2Service.getCommande2ByEntrepriseId(Number(this.authCookieService.getEntrepriseId())).subscribe({
      next: (response) => {
        if(response){
          this.step = 4
          this.userService.updateStep(Number(this.authCookieService.getUserId()),this.step).subscribe()

        }
      }
    })

  }
}
