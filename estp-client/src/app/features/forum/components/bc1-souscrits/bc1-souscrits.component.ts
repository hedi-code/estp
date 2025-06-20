import { Component, OnInit, ViewChild } from '@angular/core';
import { Commande1Service } from '../../services/commande1.service';
import { Commande1 } from '../../models/commande1.model';
import { EntrepriseService } from '../../../entreprise/entreprise.service';
import { Entreprise } from '../../../entreprise/entreprise.model';
import { forkJoin } from 'rxjs';
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
  commande: CommandeWithEntreprise | undefined;
  entreprises: Entreprise[] = [];
  pack: Pack[]=[]
  selectedCommandes: CommandeWithEntreprise[] = []
  submitted: boolean = false;
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

  


  constructor(
    private commandeService: Commande1Service,
    private entrepriseService: EntrepriseService,
    private packService: Pack1Service,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private commandeOptionService: Commande1OptionsService,
    private optionService: Option1Service,
    private cookieService: AuthCookieService
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
    if(opt.qteCommande && opt.qteCommande > 0){
      this.modificationsOptions.push(opt);
    }
    else{
      this.modificationsOptions.splice(this.modificationsOptions.findIndex(o => o.id == opt.id),1);
    }
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
}
