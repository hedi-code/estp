import { Injectable } from '@angular/core';
import { Pack } from '../../forum/models/pack1.model';
import { BehaviorSubject } from 'rxjs';

export interface Commande{
  pack: Pack,
  option: any[],
  surfacePrix:number

}
@Injectable({
  providedIn: 'root'
})

export class CommandeService {

  affichageCommande:{id?: number,title: string, price: number, quantity: string}[]=[]
  commande:{idSurfacePrixPack: number, options:{idOption: number, qte: number, price: number}[]}={
    idSurfacePrixPack: 0,
    options: []
  }
  commandeBs: BehaviorSubject<{title: string, price: number, quantity: string}[]> = new BehaviorSubject<{title: string, price: number,  quantity: string}[]>(this.affichageCommande);
  prixTotal: BehaviorSubject<number> = new BehaviorSubject<number>(0)
  constructor() { }

  addPack(selectedSurface: number){
   this.commande.idSurfacePrixPack = selectedSurface
  }
  addDisplay(title: string, price: number, quantity: string){
    this.affichageCommande.push({title,price,quantity})
    this.commandeBs.next(this.affichageCommande)
    this.getPrice();
  }
  remove(c:Commande){
    this.affichageCommande = this.affichageCommande.filter(item => {});
  }
  getPrice(){
    let prix = 0;
    this.affichageCommande.forEach(c => prix = prix + c.price*Number(c.quantity))
    this.prixTotal.next(prix);

  }

}
