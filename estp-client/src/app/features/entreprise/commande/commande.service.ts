import { Injectable } from '@angular/core';
import { Pack } from '../../forum/models/pack1.model';
import { BehaviorSubject } from 'rxjs';
import { Option1 } from '../../forum/models/option1.model';

export interface Commande {
  pack: Pack,
  option: Option1[],
  surfacePrix: number

}
@Injectable({
  providedIn: 'root'
})

export class CommandeService {

  commande: Commande = {
    pack:{},
    option: [],
    surfacePrix: 9999
  }; 
  commandeBs: BehaviorSubject<Commande> = new BehaviorSubject<Commande>(this.commande);
  prixTotal: BehaviorSubject<number> = new BehaviorSubject<number>(0)
  constructor() { }

  addPack(pack: Pack, selectedSurface: number) {
    console.log(this.commande)
    if(!!selectedSurface)
    this.commande.surfacePrix = selectedSurface
  if(!!pack)
    this.commande.pack = pack;
    this.getPrice()
  }

  getPrice() {
    console.log(this.commande)
    let prix: number = 0;
    if (!!this.commande?.pack?.surfaces)
      prix = prix + Number(this.commande.pack.surfaces.find(s => s.surface_id == this.commande.surfacePrix)?.prix);
    if (!!this.commande.option)
      this.commande.option.forEach(c => prix = prix + Number(c.prix_ht) * Number(c.qteCommande))
    this.prixTotal.next(prix);
  }
  addOption(option: Option1) {
    this.commande.option.push(option)
    this.commandeBs.next(this.commande);
    this.getPrice()
  }
  deleteOption(index: number) {
    if (index > -1 && index < this.commande.option.length) {
      this.commande.option.splice(index, 1);
      this.commandeBs.next(this.commande);
      this.getPrice();
    }
  }

  deletePack() {
    this.commande.pack = {} as Pack;
    this.commande.surfacePrix = 0;
    this.commandeBs.next(this.commande);
    this.getPrice();
  }
}
