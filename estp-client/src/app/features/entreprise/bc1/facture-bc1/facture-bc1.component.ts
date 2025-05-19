import { Component, Input, OnInit } from '@angular/core';
import { Entreprise } from '../../entreprise.model';
import { Commande, CommandeService } from '../../commande/commande.service';

@Component({
  selector: 'app-facture-bc1',
  standalone: false,
  templateUrl: './facture-bc1.component.html',
  styleUrl: './facture-bc1.component.scss'
})
export class FactureBc1Component implements OnInit{

  @Input() commande1: any;
  @Input() signature: any;
  @Input() contactPrincipal: any;
  @Input() entreprise: Entreprise | undefined;

  @Input() commercial: any;
  @Input() config: any;
  @Input() nomFichierBc1: string | undefined;
  today: Date = new Date();
  commande:Commande | undefined;
  surfacePrix: any;
  prixTotal: number = 0;

  constructor(private commandeService: CommandeService) { }

  ngOnInit() {
  this.commandeService.commandeBs.subscribe(c => {
    this.commande = c;
    this.surfacePrix = this.commande?.pack?.surfaces?.find(s => s.surface_id == this.commande?.surfacePrix)
  })
    this.commandeService.prixTotal.subscribe(p => this.prixTotal = p)
  }

}
