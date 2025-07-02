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
import { cloneDeep } from 'lodash';



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
  pack: Pack[] = []
  detailsCommande: CommandeWithEntreprise | undefined;
  optionsBc1: Option1[] = [];
  detailsOptions: Option1[] = [];
  baseUrl: String = environment.apiUrl
  role: String | null = ''


  modifyDialog: boolean = false;
  modifyCommande: CommandeWithEntreprise | undefined;
  modifyPackId: number | undefined;
  modifyPackOptions: any | undefined;
  modifyPackSurface: number | undefined;
  modificationsOptions: Option1[] = [];
  modifyTotalHt: number | undefined = 0
  modificationCommandeOption: Commande1Option[] = []
  modificationContact: Contact | undefined;

  createDialog: boolean = false
  ajoutEntreprises: Entreprise[]=[];
  ajoutEntreprise: Entreprise | undefined;
  ajoutOption: Option1[] = [];
  ajoutPacks: Pack[] = [];
  ajoutPack: Pack | undefined;
  ajoutPackSurfacePrix: any | undefined;
  ajoutTotalHt: number  = 0



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
  ) { }

  ngOnInit(): void {
    this.role = this.cookieService.getRole();
    this.initData();
  }
  initData() {
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

        const commandeIds = commandes.map(c => c.entreprise_id);
        this.ajoutEntreprises = entreprises.filter(e => !commandeIds.includes(e.id ?? -1));
        this.ajoutOption = options;
        this.ajoutPacks = pack;
        this.commandes = commandes.map(cmd => ({
          ...cmd,
          entreprise: entreprises.find(e => e.id === cmd.entreprise_id),
          pack: pack.find(p => (p.surfaces?.find(s => s.surface_id == cmd.pack1_id))),
          packDescription: this.getPackDesrcription(cmd.pack1_id ?? -1, pack.find(p => (p.surfaces?.find(s => s.surface_id == cmd.pack1_id))))
        }));
        if (this.cookieService.getRole() == "comm") {
          this.commandes = this.commandes.filter(c => c.entreprise?.commercial_id == Number(this.cookieService.getUserId()))
        }
      },
      error: (err) => console.log(err)
    });
  }
  getPackDesrcription(cmdPackId: number, pack?: Pack) {
    let ret: string = "";
    if (pack) {
      ret = pack.titre + " " + pack.surfaces?.find(s => s.surface_id == cmdPackId)?.surface + "m² (" + pack.surfaces?.find(s => s.surface_id == cmdPackId)?.prix + " €)"
    }
    return ret;
  }
  getCommandeOptionConsultation() {
    this.detailsOptions = [];
    this.commandeOptionService.getCommande1OptionByCommandeId(this.detailsCommande?.id ?? -1).subscribe(response => {
      if (response && Array.isArray(response)) {
        response.forEach(element => {
          let option: Option1 = this.optionsBc1.find(o => o.id == element.option1_id) ?? { id: -1 }
          option.qteCommande = element.qty
          this.detailsOptions.push(option);
        });
      }
    })
  }
  getCommandeOptionModification() {
    this.modificationsOptions = [];
    this.optionsBc1.forEach(option => option.qteCommande = 0);
    this.commandeOptionService.getCommande1OptionByCommandeId(this.modifyCommande?.id ?? -1).subscribe(response => {
      if (response && Array.isArray(response)) {
        this.modificationCommandeOption = response;
        response.forEach(element => {
          let option: Option1 = this.optionsBc1.find(o => o.id == element.option1_id) ?? { id: -1 }
          option.qteCommande = element.qty
          this.modificationsOptions.push(option);

        });
      }
    })
  }
  saveCommande() {
  }
  modifierOption(opt: Option1) {
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

  deleteCommande(event: Event, cmd: Commande1) {
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

  validerCommande(event: Event, cmd: Commande1) {
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
        this.commandeService.updateCommande1(cmd.id, commandeModifier).subscribe(response => {
          this.initData();
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Annulé', detail: 'Validation annulé', life: 2000 });
      }
    });
  }

  showDetailsDialog(cmd: CommandeWithEntreprise) {
    this.detailsDialog = true
    this.detailsCommande = cmd;
    this.getCommandeOptionConsultation();
  }

  getTotalTva(total: number) {
    return total * 1.2;
  }
  openModifyDialog(cmd?: CommandeWithEntreprise) {
    if(!!cmd){
    this.modifyCommande = cmd;
    this.modifyTotalHt = cmd.total_ht;
    this.modifyDialog = true;
    this.getCommandeOptionModification();
    this.modifyPackSurface = cmd.pack1_id ?? 999;
    this.modifyPackId = cmd.pack?.pack_id ?? 9999;
    this.modifyPackOptions = this.pack.find(p => p.pack_id == this.modifyPackId)?.surfaces;
    }
    else{
 this.modifyTotalHt = 0;
    this.modifyDialog = true;
    this.getCommandeOptionModification();
    this.modifyPackSurface =  -1;
    this.modifyPackId = -1;
    this.modifyPackOptions = this.pack.find(p => p.pack_id == this.modifyPackId)?.surfaces;
    }
  }
  async openFactureDialog(cmd: CommandeWithEntreprise) {
    let testPack: any
    this.modifyCommande = cloneDeep(cmd);
    if (this.modifyCommande.pack && this.modifyCommande.pack.surfaces) {
      testPack = this.modifyCommande.pack.surfaces.find(p => p.surface_id === this.modifyCommande?.pack1_id)
      this.modifyCommande.pack.selectedOption = { surface_id: testPack?.surface_id, surface: testPack?.surface, prix: Number(testPack?.prix) }
    }

    this.modifyTotalHt = cmd.total_ht;
    this.getCommandeOptionModification();
    this.modifyPackSurface = cmd.pack1_id ?? 999;
    this.modifyPackId = cmd.pack?.pack_id ?? 9999;
    this.modifyPackOptions = this.pack.find(p => p.pack_id == this.modifyPackId)?.surfaces;
    this.modificationContact = await this.getContactPrincipalNom();
    this.factureVisible = true;
  }
  getPackForCommande() {
    if (this.modifyCommande) {
      this.modifyCommande.pack1_id = 9999
    }
    this.modifyPackOptions = this.pack.find(p => p.pack_id == this.modifyPackId)?.surfaces;
  }

  getModifyCommandePrix() {
    this.modifyTotalHt = 0;
    this.modifyTotalHt = Number(this.modifyPackOptions.find((p: { surface_id: number | null | undefined; }) => p.surface_id == this.modifyCommande?.pack1_id)?.prix);
    this.modificationsOptions.forEach(o => {
      if (o && this.modifyTotalHt) {
        this.modifyTotalHt += (o.qteCommande ?? 0) * (o.prix_ht ?? 0)
      }
    })
  }
  validerOptionPackCommande() {
    if (this.modifyCommande) {
      if (this.modifyTotalHt) {
        this.modifyCommande.total_ht = this.modifyTotalHt
      }
      this.commandeService.updateCommande1(this.modifyCommande?.id ?? -1, this.modifyCommande).subscribe({
        error: (err) => console.log(err)
      });
      this.modificationsOptions.forEach(o => {
        if (o.qteCommande == 0) {
          this.commandeOptionService.deleteCommande1Option(this.modificationCommandeOption.find(op => op.option1_id === o.id)?.id ?? -1).subscribe({
            error: (err) => console.log(err)
          });
        }
        else if (o.qteCommande && o.qteCommande > 0) {
          let option: Commande1Option | undefined = this.modificationCommandeOption.find(op => op.option1_id === o.id);
          if (option) {
            option.qty = o.qteCommande || -1;
            this.commandeOptionService.updateCommande1Option(option.id ?? -1, option).subscribe({
              error: (err) => console.log(err)
            });
          }
          else {
            this.commandeOptionService.createCommande1Option({ commande1_id: this.modifyCommande?.id ?? -1, option1_id: o.id, qty: o.qteCommande }).subscribe()
          }
        }

      })
      this.commandes[this.commandes.findIndex(c => c.id == this.modifyCommande?.id)].total_ht = this.modifyTotalHt ?? 0
    }
  }
  async getContactPrincipalNom(): Promise<Contact | undefined> {
    const id = this.modifyCommande?.entreprise?.contact_principal_id ?? -1;
    try {
      const contact = await firstValueFrom(this.contactService.getContact(id));
      return contact;
    } catch (error) {
      console.error('Error fetching contact:', error);
      return;
    }
  }
 async envoyerFacture() {
  const today = new Date();
const dueDate = new Date(today);
dueDate.setDate(today.getDate() + 15);
const formattedDate = dueDate.toLocaleDateString('fr-FR');
  try {
    // Step 1: Wait for PDF to be generated and uploaded
    await this.factureBc1.generatedPdf(
      "facture",
      `festp.2025.${this.factureBc1.modifyCommandeFact?.entreprise_id}.fct1`,
      "contentToExport"
    );

    // Step 2: Send the email with attachment
    await lastValueFrom(this.emailService.sendInvoice({
      senderEmail: "ne-pas-repondre.facturation@forumestp.fr",
      receiverEmail: this.modificationContact?.email ?? "hedibensafegine.noxaved@gmail.com",
      receiverName: `${this.factureBc1.modificationContact?.prenom} ${this.factureBc1.modificationContact?.nom}`,
      subject: this.modificationContact?.email ? "Facture du BC1" : "ERREUR FACTURATION",
      htmlText: `
        <p>Cher(e) <strong>${this.factureBc1.modificationContact?.prenom} ${this.factureBc1.modificationContact?.nom}</strong>,</p>
        <p>J’espère que vous allez bien.</p>
        <p>
        Nous tenons à vous remercier pour votre confiance. Nous préparons actuellement tout le nécessaire pour que votre journée au Forum soit une réussite.
        </p>
        <p>
        Veuillez trouver ci-joint la facture <strong>festp.2025.${this.modifyCommande?.entreprise_id}.fct1</strong> relative à votre bon de commande <strong>BC1</strong> pour le <strong>FORUM ESTP 46ème édition</strong>.
        </p>
        <p>
        Conformément à nos conditions de paiement, nous vous prions de bien vouloir régler un acompte de <strong>${(this.modifyCommande?.total_ht ?? 0) * 1.2 / 2}€</strong> avant le <strong>${formattedDate}</strong>.
        <br/>
        Le solde restant de <strong>${(this.modifyCommande?.total_ht ?? 0) * 1.2 / 2}€</strong> devra être réglé avant le <strong>10 novembre 2025</strong>.
        </p>
        <p>
        Nous vous remercions par avance pour le respect de ces échéances nécessaires à la bonne organisation de notre Forum. Pour toute question ou information complémentaire, n’hésitez pas à me contacter directement.
        </p>
        <p>Merci pour votre confiance et votre collaboration.</p>
        <p>Cordialement,</p>
        <p>
        <strong>Kahina SAIBI</strong><br />
        Trésorière FORUM ESTP<br />
        0781616766<br />
        <a href="mailto:kahina.saibi@forumestp.fr">kahina.saibi@forumestp.fr</a>
        </p>
      `,
      ccEmails: ["kahina.saibi@forumestp.fr"],
      attachmentName: `festp.2025.${this.modifyCommande?.entreprise_id}.fct1.pdf`
    }));

    // Step 3: Set fct_envoyee = true in backend
    this.commandeService.setFactureEnvoyee(this.modifyCommande?.id ?? -1).subscribe({
      next: () => {
        const index = this.commandes.findIndex(c => c.id === this.modifyCommande?.id);
        if (index !== -1) this.commandes[index].fct_envoyee = true;
      }
    });

  } catch (err) {
    console.error("❌ Error during envoyerFacture:", err);
  }
}

 async downloadFacture() {
  await this.factureBc1.generatedPdf(
    "facture",
    "festp.2025." + this.factureBc1.modifyCommandeFact?.entreprise_id + ".fct1",
    "contentToExport"
  );

  const filePath = `${this.baseUrl}/api/uploads/facture/festp.2025.${this.modifyCommande?.entreprise_id}.fct1.pdf`;
  const link = document.createElement('a');
  link.href = filePath;
  link.setAttribute('target', '_blank');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

  setFacturePayee(cmd: Commande1) {
    this.commandeService.setFacturePayee(cmd.id).subscribe({
      next: (success) => {
        this.commandes[this.commandes.findIndex(c => c.id === cmd.id)].fct_payee = true;
      }
    })
  }
  openModifierFactureDialog() {
    this.factureBc1.visible = true
  }
  openCreateDialog(){
    this.createDialog = true;
    this.ajoutTotalHt = 0;
  }
  calculerCreerPrix(){
    this.ajoutTotalHt = 0;
    this.ajoutTotalHt = this.ajoutTotalHt + Number(this.ajoutPackSurfacePrix.prix);
    this.ajoutOption.forEach(o=> {if(o.qteCommande){this.ajoutTotalHt = this.ajoutTotalHt + ((o.prix_ht ?? 1)*(o.qteCommande ?? 1))}})
    console.log(this.ajoutTotalHt)
  }
  createNouvelleCommande(){
    this.commandeService.createCommande1({
      entreprise_id: this.ajoutEntreprise?.id ?? -1,
      valide: false,
      total_ht: this.ajoutTotalHt,
      pack1_id: this.ajoutPackSurfacePrix.surface_id
    }).subscribe({
      
    })
  }
}
