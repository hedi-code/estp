import { Component } from '@angular/core';
import { Pack1Service } from '../../services/pack1.service';
import { Pack } from '../../models/pack1.model';
import { Option1 } from '../../models/option1.model';
import { Option1Service } from '../../services/option1.service';
import { environment } from '../../../../../environments/environment';
import { ConfirmationService } from 'primeng/api';
import { FileService } from '../../../../core/services/file.service';

@Component({
  selector: 'app-gestion-bc1',
  standalone: false,
  templateUrl: './gestion-bc1.component.html',
  styleUrl: './gestion-bc1.component.scss'
})
export class GestionBc1Component {

  baseUrl: String = environment.apiUrl
  packs:Pack []= []
  options: Option1[]=[]
  activeIndex: number =0;
  selectedOpt!: Option1;
  editDialogVisible: boolean = false;
  selectedPack!: Pack;
  editPackDialogVisible = false;
  selectedFile: File | null = null;
  

  constructor(private fileService: FileService, private packService: Pack1Service, private optionService: Option1Service, private confirmationService: ConfirmationService){}

  ngOnInit(): void {
   this.loadPacks()
   this.loadOptions()
    
  }
   loadOptions() {
    this.optionService.getAllOptions().subscribe(data => this.options = data);
  }
  loadPacks(){
     this.packService.getAllPacks().subscribe(
      packs => this.packs = packs
    )
  }
 // ---- Edit ----
  onEditOpt(opt: Option1) {
    this.selectedOpt = { ...opt }; // copie pour ne pas modifier directement
    this.editDialogVisible = true;
  }

  confirmEditOpt() {
     if (this.selectedFile?.name) {
      // upload first, then update pack
    const originalName = this.selectedFile?.name ?? '';
    let extension = originalName.includes('.') ? originalName.split('.').pop() : '';
    let newName = originalName.includes(extension ?? '') ? originalName.split('.').reverse().pop() : this.selectedFile?.name
      this.fileService.uploadFile(this.selectedFile, 'img%2Foption1s%2F'+this.selectedOpt.id, newName)
        .subscribe(() => {
          this.selectedOpt.img = newName+'.'+extension;
 this.optionService.updateOption(this.selectedOpt.id, this.selectedOpt).subscribe(() => {
      this.editDialogVisible = false;
      this.loadOptions();
    });        });
    } else {
 this.optionService.updateOption(this.selectedOpt.id, this.selectedOpt).subscribe(() => {
      this.editDialogVisible = false;
      this.loadOptions();
    });    }
  }

  // ---- Delete ----
  onDeleteOpt(opt: Option1) {
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de supprimer cette option ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.optionService.deleteOption(opt.id).subscribe(() => {
          this.loadOptions();
        });
      }
    });
  }
 // ================= EDIT PACK =================
  onEditPack(pack: Pack) {
    this.selectedPack = JSON.parse(JSON.stringify(pack)); // deep copy
    this.editPackDialogVisible = true;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedPack.img = URL.createObjectURL(file); // preview
    }
  }

  confirmEditPack() {
    if (this.selectedFile?.name) {
      // upload first, then update pack
    const originalName = this.selectedFile?.name ?? '';
    let extension = originalName.includes('.') ? originalName.split('.').pop() : '';
    let newName = originalName.includes(extension ?? '') ? originalName.split('.').reverse().pop() : this.selectedFile?.name
      this.fileService.uploadFile(this.selectedFile, 'img%2Fpack1', newName)
        .subscribe(() => {
          this.selectedPack.img = newName+'.'+extension;
          this.updatePackData();
        });
    } else {
      this.updatePackData();
    }
  }

  private async updatePackData() {
    await this.packService.updatePack(this.selectedPack.pack_id!, this.selectedPack).subscribe(() => {
      this.editPackDialogVisible = false;
    });
    await this.selectedPack?.surfaces?.forEach(element => {
      if(!!!this.packs.some(pack => pack.surfaces?.some(s => JSON.stringify(s) === JSON.stringify(element))))
      this.packService.updateSurface(element.surface_id, element).subscribe();
    });
    await this.selectedPack?.options?.forEach(element => {
      if(!!!this.packs.some(pack => pack.options?.some(s => JSON.stringify(s) === JSON.stringify(element))))
      this.packService.updateOption(element.option_id, element).subscribe();
    });
    await this.loadPacks()
  }

  async deletePackOption(id: number){
    await this.packService.deleteOption(id).subscribe();
    await this.loadPacks()

  }
  async deletePackSurface(id: number){
    await this.packService.deletePack(id).subscribe();
    await this.loadPacks()

  }
  // ================= DELETE PACK =================
  onDeletePack(pack: Pack) {
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de supprimer ce pack ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.packService.deletePack(pack.pack_id!).subscribe(() => {
          this.loadPacks();
        });
      }
    });
  }

  // ================= OPTIONS =================
  onEditOption(opt: any) {
    if(this.selectedPack && this.selectedPack.options){

      this.selectedPack.options = this.selectedPack.options.map(o => o.option_id === opt.option_id ? opt : o);
      this.packService.updateOption(opt.option_id!, { description: opt.option_description }).subscribe(() => {
        this.loadPacks();
      });
    }
  }

  onDeleteOption(opt: any) {
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de supprimer cette option ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.packService.deleteOption(opt.option_id!).subscribe(() => {
          this.loadPacks();
        });
      }
    });
  }

  // ================= SURFACES =================
  onEditSurface(surface: any) {
    this.packService.updateSurface(surface.surface_id, surface).subscribe(() => {
      this.loadPacks();
    });
  }

  onDeleteSurface(surface: any) {
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de supprimer cette surface ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.packService.deleteSurface(surface.surface_id).subscribe(() => {
          this.loadPacks();
        });
      }
    });
  }
}
