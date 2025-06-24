import { Component, OnInit, ViewChild } from '@angular/core';
import { Commande1Service } from '../../services/commande1.service';
import { Commande1, Commande1Option } from '../../models/commande1.model';
import { EntrepriseService } from '../../../entreprise/entreprise.service';
import { Entreprise } from '../../../entreprise/entreprise.model';
import { firstValueFrom, forkJoin, lastValueFrom } from 'rxjs';
import { Pack1Service } from '../../services/pack1.service';
import { Pack } from '../../models/pack1.model';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Commande1OptionsService } from '../../services/commande1-options.service';
import { Option1Service } from '../../services/option1.service';
import { Option1 } from '../../models/option1.model';
import { environment } from '../../../../../environments/environment';
import { AuthCookieService } from '../../../../core/services/auth-cookie.service';
import { ContactService } from '../../models/contact.service';
import { Contact } from '../../models/contact.model';
import { Bc1SouscritFactureComponent } from './bc1-souscrit-facture/bc1-souscrit-facture.component';
import { EmailService } from '../../../../core/services/email.service';


interface CommandeWithEntreprise extends Commande1 {
  entreprise?: Entreprise,
  pack?: Pack,
  packDescription?: string,
  options?: Option1[]
}

@Component({
  selector: 'app-bc1-souscrits',
  standalone: false,
  templateUrl: './bc1-souscrits.component.html',
  styleUrl: './bc1-souscrits.component.scss'
})
export class Bc1SouscritsComponent implements OnInit {
  detailsDialog: boolean = false;
  commandes: CommandeWithEntreprise[] = [];
  entreprises: Entreprise[] = [];
  pack: Pack[]=[]
  detailsCommande: CommandeWithEntreprise | undefined;
  optionsBc1: Option1[]=[];
  detailsOptions: Option1[]=[];
  baseUrl: String = environment.apiUrl
  role: String | null=''


  modifyDialog: boolean = false;
  modifyCommande:CommandeWithEntreprise | undefined;
  modifyPackId: number | undefined;
  modifyPackOptions: any | undefined;
  modifyPackSurface: number | undefined;
  modificationsOptions: Option1[]=[];
  modifyTotalHt: number | undefined = 0
  modificationCommandeOption: Commande1Option[]=[]
  modificationContact: Contact | undefined;

  factureVisible: boolean = false;
  @ViewChild('factureBc1') factureBc1!: Bc1SouscritFactureComponent;


  constructor(
    private commandeService: Commande1Service,
    private entrepriseService: EntrepriseService,
    private packService: Pack1Service,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private commandeOptionService: Commande1OptionsService,
    private optionService: Option1Service,
    private cookieService: AuthCookieService,
    private contactService: ContactService,
    private emailService: EmailService
  ) {}

  ngOnInit(): void {
  this.role = this.cookieService.getRole();
   this.initData();
  }
  initData(){
     forkJoin({
      commandes: this.commandeService.getAllCommande1s(),
      entreprises: this.entrepriseService.getAllEntreprises(),
      pack: this.packService.getAllPacks(),
      options: this.optionService.getAllOptions()
    }).subscribe({
      next: ({ commandes, entreprises, pack, options }) => {
        this.optionsBc1 = options
        this.entreprises = entreprises;
        this.pack = pack
        this.commandes = commandes.map(cmd => ({
          ...cmd,
          entreprise: entreprises.find(e => e.id === cmd.entreprise_id),
          pack: pack.find(p => (p.surfaces?.find(s=> s.surface_id == cmd.pack1_id) )),
          packDescription: this.getPackDesrcription(cmd.pack1_id ?? -1, pack.find(p => (p.surfaces?.find(s=> s.surface_id == cmd.pack1_id) )))
        }));
         if(this.cookieService.getRole() == "comm"){
          this.commandes = this.commandes.filter(c => c.entreprise?.commercial_id == Number(this.cookieService.getUserId()))
        }
      },
      error: (err) => console.log(err)
    });
  }
  getPackDesrcription(cmdPackId:number,pack?: Pack){
    let ret: string="";
    if(pack){
      ret = pack.titre+" "+ pack.surfaces?.find(s=> s.surface_id == cmdPackId)?.surface + "m² (" + pack.surfaces?.find(s=> s.surface_id == cmdPackId)?.prix + " €)"
  }
  return ret;
  }
  getCommandeOptionConsultation(){
    this.detailsOptions = [];
    this.commandeOptionService.getCommande1OptionByCommandeId(this.detailsCommande?.id ?? -1).subscribe(response => {
      if(response && Array.isArray(response)){
        response.forEach(element => {
          let option:Option1 = this.optionsBc1.find(o=> o.id == element.option1_id) ?? {id: -1}
          option.qteCommande = element.qty
          this.detailsOptions.push(option);
        });
      }
    })
  }
  getCommandeOptionModification(){
    this.modificationsOptions = [];
    this.optionsBc1.forEach(option => option.qteCommande = 0);
    this.commandeOptionService.getCommande1OptionByCommandeId(this.modifyCommande?.id ?? -1).subscribe(response => {
      if(response && Array.isArray(response)){
        this.modificationCommandeOption = response;
        response.forEach(element => {
          let option:Option1 = this.optionsBc1.find(o=> o.id == element.option1_id) ?? {id: -1}
            option.qteCommande = element.qty
            this.modificationsOptions.push(option);
          
        });
      }
    })
  }
  saveCommande(){
  }
  modifierOption(opt:Option1){
    // if(opt.qteCommande && opt.qteCommande >= 0 ){
    //   this.modificationsOptions.push(opt);
    // }
    // else{
    //   this.modificationsOptions.splice(this.modificationsOptions.findIndex(o => o.id == opt.id),1);
    // }
    // this.getModifyCommandePrix()
    // console.log(this.modificationsOptions);
    
      
      this.modificationsOptions.push(opt);
      
      this.getModifyCommandePrix()
    
    console.log(this.modificationsOptions);
  }

  deleteCommande(event: Event,cmd:Commande1){
     this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Voulez vous supprimer ce BC1 ?',
            icon: 'pi pi-info-circle',
            acceptLabel: 'Confirmer',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            accept: () => {
              this.commandeService.deleteCommande1(cmd.id).subscribe(response => {
               this.initData();
              });
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'Annulé', detail: 'Supression annulé', life: 2000 });
            }
        });
    }
  
  validerCommande(event: Event, cmd:Commande1){
    this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Voulez vous valider ce BC1 ?',
            icon: 'pi pi-info-circle',
            acceptLabel: 'Confirmer',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-sm',
            accept: () => {
              let commandeModifier: Commande1 = cmd;
              commandeModifier.valide = true;
              this.commandeService.updateCommande1(cmd.id,commandeModifier).subscribe(response => {
                this.initData();
              });
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'Annulé', detail: 'Validation annulé', life: 2000 });
            }
        });
  }
  
  showDetailsDialog(cmd:CommandeWithEntreprise) {
    this.detailsDialog = true
    this.detailsCommande = cmd;
    this.getCommandeOptionConsultation();
  }

  getTotalTva(total :number){
    return total*1.2;
  }
  openModifyDialog(cmd:CommandeWithEntreprise){
    this.modifyCommande = cmd;
    this.modifyTotalHt = cmd.total_ht;
    this.modifyDialog = true;
    this.getCommandeOptionModification();
    this.modifyPackSurface = cmd.pack1_id ?? 999;
    this.modifyPackId = cmd.pack?.pack_id ?? 9999;
    this.modifyPackOptions =  this.pack.find(p => p.pack_id == this.modifyPackId)?.surfaces;
  }
    async openFactureDialog(cmd:CommandeWithEntreprise){
      let testPack:any
    this.modifyCommande = cmd;
    if(this.modifyCommande.pack && this.modifyCommande.pack.surfaces){
      testPack = this.modifyCommande.pack.surfaces.find(p=>p.surface_id === this.modifyCommande?.pack1_id)
      this.modifyCommande.pack.selectedOption = {surface_id: testPack?.surface_id, surface: testPack?.surface, prix: Number(testPack?.prix)}
    }
  
    this.modifyTotalHt = cmd.total_ht;
    this.getCommandeOptionModification();
    this.modifyPackSurface = cmd.pack1_id ?? 999;
    this.modifyPackId = cmd.pack?.pack_id ?? 9999;
    this.modifyPackOptions =  this.pack.find(p => p.pack_id == this.modifyPackId)?.surfaces;
    this.modificationContact = await this.getContactPrincipalNom();
    this.factureVisible = true;
  }
getPackForCommande(){
  if(this.modifyCommande){
    this.modifyCommande.pack1_id = 9999
  }
    this.modifyPackOptions =  this.pack.find(p => p.pack_id == this.modifyPackId)?.surfaces;
}

getModifyCommandePrix(){
  this.modifyTotalHt = 0;
  this.modifyTotalHt = Number(this.modifyPackOptions.find((p: { surface_id: number | null | undefined; }) => p.surface_id == this.modifyCommande?.pack1_id)?.prix);
  this.modificationsOptions.forEach(o=>{
    if(o && this.modifyTotalHt){
      this.modifyTotalHt += (o.qteCommande ?? 0) * (o.prix_ht ?? 0)
    }
  })
}
  validerOptionPackCommande() {
    if (this.modifyCommande) {
      if(this.modifyTotalHt){
      this.modifyCommande.total_ht = this.modifyTotalHt}
      this.commandeService.updateCommande1(this.modifyCommande?.id ?? -1, this.modifyCommande).subscribe({
        error: (err) => console.log(err)
      });
      this.modificationsOptions.forEach(o => {
        if (o.qteCommande == 0) {
          this.commandeOptionService.deleteCommande1Option(this.modificationCommandeOption.find(op => op.option1_id === o.id)?.id ?? -1).subscribe({
            error: (err) => console.log(err)
          });
        }
        else if (o.qteCommande && o.qteCommande >  0){
          let option: Commande1Option | undefined = this.modificationCommandeOption.find(op => op.option1_id === o.id);
          if(option){
             option.qty = o.qteCommande || -1;
          this.commandeOptionService.updateCommande1Option(option.id ?? -1, option).subscribe({
            error: (err) => console.log(err)
          });
          }
          else{
            this.commandeOptionService.createCommande1Option({commande1_id: this.modifyCommande?.id ?? -1, option1_id: o.id, qty: o.qteCommande}).subscribe()
          }
        }
       
      })
    }
  }
async getContactPrincipalNom(): Promise<Contact | undefined> {
  const id = this.modifyCommande?.entreprise?.contact_principal_id ?? -1;
  try {
    const contact = await firstValueFrom(this.contactService.getContact(id));
    return contact;
  } catch (error) {
    console.error('Error fetching contact:', error);
    return ;
  }
}
  async envoyerFacture(){
  try {
    // 🔸 Step 1: Wait for PDF generation
    await this.factureBc1.generatedPdf("facture", "festp.2025."+this.modifyCommande?.entreprise_id+".fct1", "contentToExport");
    await lastValueFrom(
    this.emailService.sendInvoice({
      senderEmail: "ne-pas-repondre.facturation@forumestp.fr",
      receiverEmail: "hedibensafegine7@gmail.com",
      receiverName: "hedi",
      subject: "test",
      htmlText: "teset email",
      ccEmails: ["hedibensafegine.noxaved@gmail.com"],
      attachmentName: "festp.2025." + this.modifyCommande?.entreprise_id + ".fct1.pdf"
    }));
  }catch (err) {
    console.error("❌ Error during BC1 creation", err);
  }
}
openModifierFactureDialog(){
  this.factureBc1.visible = true
}
}
