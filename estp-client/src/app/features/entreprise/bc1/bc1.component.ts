import { Component, OnInit } from '@angular/core';
import { Pack1Service } from '../../forum/services/pack1.service';
import { environment } from './../../../../environments/environment';
import { Pack } from '../../forum/models/pack1.model';
import { CommandeService } from '../commande/commande.service';
import { Option1 } from '../../forum/models/option1.model';
import { Option1Service } from '../../forum/services/option1.service';


@Component({
  selector: 'app-bc1',
  standalone: false,
  templateUrl: './bc1.component.html',
  styleUrl: './bc1.component.scss'
})
export class Bc1Component implements OnInit{

  baseUrl: String = environment.apiUrl
  pack1s: Pack[] = []
  options: Option1[] = [];  // Store options here

  selectedOption:any;
  selectedOption2:any;
  isDisabled= true
  constructor(private pack1Service: Pack1Service, private commandeService: CommandeService, private option1Service: Option1Service){}

  ngOnInit(){
    this.pack1Service.getAllPacks().subscribe({
      next: (response) => {
        this.pack1s = response;
      },
      error: (err) => {
        console.log(err)
      }
    })
    // Fetch options when the component is initialized
    this.option1Service.getAllOptions().subscribe({
      next: (data) => {
        this.options = data;  // Assign data to options array
      },
      error: (err) => {
        console.error('Error fetching options:', err);
      }
    });
  }

  addBtnIsDisabled(){
    return !!!this.selectedOption
  }

  addToCommand(pack: Pack){
    this.commandeService.addDisplay(pack.titre + " " + this.selectedOption.surface + "m²", this.selectedOption.prix, "1");
    this.commandeService.addPack(this.selectedOption ? this.selectedOption.id : this.selectedOption2.id);
    this.isDisabled = false;
    
  }
}
