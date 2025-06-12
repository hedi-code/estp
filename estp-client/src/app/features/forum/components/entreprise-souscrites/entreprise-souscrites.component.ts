import { Component, OnInit } from '@angular/core';
import { EntrepriseService } from '../../../entreprise/entreprise.service';
import { Entreprise } from '../../../entreprise/entreprise.model';

@Component({
  selector: 'app-entreprise-souscrites',
  standalone: false,
  templateUrl: './entreprise-souscrites.component.html',
  styleUrl: './entreprise-souscrites.component.scss'
})
export class EntrepriseSouscritesComponent implements  OnInit{

  entreprises: Entreprise[]=[]

  constructor(private entrepriseService: EntrepriseService){

  }
  ngOnInit(): void {
    this.entrepriseService.getAllEntreprises().subscribe({
      next: (response) => {
        this.entreprises = response;
      },
      error: (err) => console.log(err)
  })}
}
