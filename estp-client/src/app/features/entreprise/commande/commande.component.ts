import { Component } from '@angular/core';
import { Commande, CommandeService } from './commande.service';

@Component({
  selector: 'app-commande',
  standalone: false,
  templateUrl: './commande.component.html',
  styleUrl: './commande.component.scss'
})
export class CommandeComponent {

  commande: Commande = {
    pack: {
      // example Pack properties
},
    option: [
      {
        // example Option1 properties
        id: 9999,
      },
      {
        id: 9999,
      }
    ],
    surfacePrix: 9999
  };
  
  price!: number;
  constructor(private commandeService: CommandeService){
  }
  ngOnInit(){
    this.commandeService.commandeBs.subscribe(c => this.commande = c)
    this.commandeService.prixTotal.subscribe(p => this.price = p)
  }

  getSurfacePrix(){
    return this.commande?.pack?.surfaces?.find(s => s.surface_id == this.commande.surfacePrix);
  }
  deleteOption(optionId: number){
    this.commandeService.deleteOption(optionId);
  }
  deletePack(){
    this.commandeService.deletePack();
  }
}
