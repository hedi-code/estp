import { Component, OnInit } from '@angular/core';
import { AuthCookieService } from '../../core/services/auth-cookie.service';
import { EntrepriseService } from './entreprise.service';
import { UserService } from '../forum/services/user.service';
import { Router } from '@angular/router';


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

  constructor(private authCookieService: AuthCookieService, private entrepriseService: EntrepriseService, private userService: UserService, private router:Router){}

  ngOnInit(): void {
    this.entrepriseService.getEntrepriseByUserId().subscribe()
    this.nom = this.authCookieService.getFirstName() + " " + this.authCookieService.getLastName();
    this.step = Number(this.authCookieService.getStep())
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
}
