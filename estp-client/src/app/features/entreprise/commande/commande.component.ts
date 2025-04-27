import { Component } from '@angular/core';
import { Commande, CommandeService } from './commande.service';

@Component({
  selector: 'app-commande',
  standalone: false,
  templateUrl: './commande.component.html',
  styleUrl: './commande.component.scss'
})
export class CommandeComponent {

  commande!: any[];

  constructor(private commandeService: CommandeService){
  }
  ngOnInit(){
    this.commandeService.commandeBs.subscribe(c => this.commande = c)
  }
}
