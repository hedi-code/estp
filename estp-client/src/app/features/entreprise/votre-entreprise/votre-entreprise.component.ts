import { Component, OnInit } from '@angular/core';
import { Contact } from '../../forum/models/contact.model';
import { ContactService } from '../../forum/models/contact.service';
import { AuthCookieService } from '../../../core/services/auth-cookie.service';
import { Entreprise } from '../entreprise.model';
import { EntrepriseService } from '../entreprise.service';

@Component({
  selector: 'app-votre-entreprise',
  standalone: false,
  templateUrl: './votre-entreprise.component.html',
  styleUrl: './votre-entreprise.component.scss'
})
export class VotreEntrepriseComponent implements OnInit{
  participationOptions: any[] = [{ label: 'Oui', value: 1 },{ label: 'Non', value: 0 }];
  contacts: Contact[]=[];
  email: string = "";
  nom: string = "";
  prenom: string = "";
  poste: string = "";
  tel: string = "";
  contactPrincipalId:number | undefined;
  entreprise: Entreprise= {
    nom: '',
    logo: '',
    siren: ''
  }

  constructor(private contactService: ContactService, private cookieService: AuthCookieService, private entrepriseService: EntrepriseService){}

  ngOnInit(): void {
    this.contactPrincipalId = Number(this.cookieService.getContacPrincipaltId()) ;
    console.log(this.contactPrincipalId)
    this.contactService.getContactByUserId().subscribe({
      next: (response) => { this.contacts = response ; console.log(this.contacts)},
      error: (error) => { alert(error.error)}
    })
    this.entrepriseService.getEntrepriseById(Number(this.cookieService.getEntrepriseId())).subscribe({
      next: (response) => {this.entreprise = {
        id: response.id,
        contact_principal_id: response.contact_principal_id,
        user_id: response.user_id,
        commercial_id: response.commercial_id,
        secteur_id: response.secteur_id,
        nom: response.nom,
        logo: response.logo,
        siren: response.siren,
        adresse: response.adresse,
        created: response.created,
        modified: response.modified,
        telephone_standard: response.telephone_standard,
        telephone_fax: response.telephone_fax,
        siteweb: response.siteweb,
        fct_adresse: response.fct_adresse,
        fct_nom: response.fct_nom,
        has_participated: !!!response.has_participated ? 0 : 1,
        activity: response.activity
      }},
      error: (error) => {console.error(error.error)}
    });
    
  } 

  addContact(){
    this.contacts.push({user_id: this.cookieService.getUserId() || "",email: this.email, nom: this.nom, prenom: this.prenom, fonction: this.poste, telephone1: this.tel, standiste: false})
  }

  deleteRow(contact: Contact): void {
    this.contacts = this.contacts.filter(c => c !== contact);
  }

  update(){
    console.log(this.entreprise)
    this.entrepriseService.updateEntreprise(this.entreprise.id || 999999, this.entreprise).subscribe({
      next: (response) => console.log(response),
      error: (error) => console.error(error)
    })
    this.contacts.forEach(contact => {
      if(contact.id != this.entreprise.contact_principal_id || !!!contact.id){
        this.contactService.createContact(contact).subscribe({
          next: (response) => console.log(response),
          error: (error) => console.error(error)
        })
      }
      else{
        this.contactService.updateContact(contact.id || 999999, contact).subscribe({
          next: (response) => console.log(response),
          error: (error) => console.error(error)
        })
      }
    })
  }
}
