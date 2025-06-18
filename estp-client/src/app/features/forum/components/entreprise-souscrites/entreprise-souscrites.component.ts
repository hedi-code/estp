import { Component, OnInit } from '@angular/core';
import { EntrepriseService } from '../../../entreprise/entreprise.service';
import { Entreprise } from '../../../entreprise/entreprise.model';
import { AuthCookieService } from '../../../../core/services/auth-cookie.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { Commande1 } from '../../models/commande1.model';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-entreprise-souscrites',
  standalone: false,
  templateUrl: './entreprise-souscrites.component.html',
  styleUrl: './entreprise-souscrites.component.scss'
})
export class EntrepriseSouscritesComponent implements OnInit {

  entreprises: Entreprise[] = []
  commercials: User[] = [];
  cmdAssigner: Entreprise | undefined;
  assignModel = false;
  role: String | null = ''
  

  constructor(private entrepriseService: EntrepriseService, private userService: UserService, private cookieService: AuthCookieService, private messageService: MessageService) {

  }
  ngOnInit(): void {
    this.role = this.cookieService.getRole();
    this.entrepriseService.getAllEntreprises().subscribe({
      next: (response) => {
        if(this.cookieService.getRole() == "comm"){
          this.entreprises = response.filter(e => e.commercial_id == Number(this.cookieService.getUserId()));
        }
        else{
          this.entreprises = response;
        }
      },
      error: (err) => console.log(err)
    })
    this.userService.getCommercials().subscribe({
      next: (response) => {
        this.commercials = response
      },
      error: (err) => console.log(err)
    })
  }

  getCommercialData(id: number):User | undefined{
    return this.commercials.find(u => u.id == id);
  }
  assigner(cmd: Entreprise){
    this.cmdAssigner = cmd;
    this.assignModel = true;
  }
  onRowDoubleClick(event: any){
if (this.cmdAssigner) {
  this.cmdAssigner.commercial_id = event.id;
  console.log(event)
    console.log(this.cmdAssigner)
  this.entrepriseService.updateEntreprise(this.cmdAssigner.id ?? 9999, this.cmdAssigner).subscribe({
    next: (response) => {
      this.messageService.add({ severity: 'success', summary: '', detail: 'Commercial assigné', life: 2000 });
      this.assignModel = false;
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: '', detail: 'Database error', life: 2000 });

    }
  })
}
    
  }
}
