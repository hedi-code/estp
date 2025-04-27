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

  affichageCommande:{title: string, price: number, quantity: string}[]=[]
  commande:{idSurfacePrixPack: number, options:{idOption: number, qte: number, price: number}[]}={
    idSurfacePrixPack: 0,
    options: []
  }
  commandeBs: BehaviorSubject<{title: string, price: number, quantity: string}[]> = new BehaviorSubject<{title: string, price: number,  quantity: string}[]>(this.affichageCommande);

  constructor() { }

  addPack(selectedSurface: number){
   this.commande.idSurfacePrixPack = selectedSurface
  }
  addDisplay(title: string, price: number, quantity: string){
    this.affichageCommande.push({title,price,quantity})
    this.commandeBs.next(this.affichageCommande)
  }

}
