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
  addPackDialogVisible = false;
  addOptionDialogVisible = false;
  selectedFile: File | null = null;
  newPack: Pack = { pack_id: 0, type: '', titre: '', description: '', img: '', surfaces: [], options: [] };
  newOption: Option1 = { id: 0, name: '', prix_ht: 0, qmax: 0, ordre: 0, description: '', img: '' };
  newPackSurfaces: {surface?: number, prix?: string}[] = [];
  newPackOptions: {option_description?: string}[] = [];
  

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
    this.selectedFile = null;
    this.editDialogVisible = true;
  }

  confirmEditOpt() {
    if (this.selectedFile?.name) {
      // upload first, then update option
      const originalName = this.selectedFile?.name ?? '';

      this.fileService.uploadFile(this.selectedFile, `img/option1s/${this.selectedOpt.id}`, originalName.split('.')[0])
        .subscribe(() => {
          this.selectedOpt.img = originalName;
          this.optionService.updateOption(this.selectedOpt.id, this.selectedOpt).subscribe(() => {
            this.editDialogVisible = false;
            this.loadOptions();
          });
        });
    } else {
      this.optionService.updateOption(this.selectedOpt.id, this.selectedOpt).subscribe(() => {
        this.editDialogVisible = false;
        this.loadOptions();
      });
    }
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
    this.selectedFile = null;
    this.editPackDialogVisible = true;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const preview = URL.createObjectURL(file);

      if (this.editPackDialogVisible && this.selectedPack) {
        this.selectedPack.img = preview;
      } else if (this.editDialogVisible && this.selectedOpt) {
        this.selectedOpt.img = preview;
      } else if (this.addPackDialogVisible && this.newPack) {
        this.newPack.img = preview;
      } else if (this.addOptionDialogVisible && this.newOption) {
        this.newOption.img = preview;
      }
    }
  }

  confirmEditPack() {
    if (this.selectedFile?.name) {
      // upload first, then update pack
      const originalName = this.selectedFile?.name ?? '';
      let extension = originalName.includes('.') ? originalName.split('.').pop() : '';

      this.fileService.uploadFile(this.selectedFile, 'img/pack1', `${this.selectedPack.pack_id}`)
        .subscribe(() => {
          this.selectedPack.img = `${this.selectedPack.pack_id}.${extension}`;
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
    await this.packService.deleteSurface(id).subscribe();
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

  // ================= ADD PACK =================
  onAddPack() {
    this.newPack = { pack_id: 0, type: '', titre: '', description: '', img: '', surfaces: [], options: [] };
    this.newPackSurfaces = [];
    this.newPackOptions = [];
    this.selectedFile = null;
    this.addPackDialogVisible = true;
  }

  // Methods for managing surfaces in new pack
  addNewPackSurface() {
    this.newPackSurfaces.push({ surface: 0, prix: '' });
  }

  removeNewPackSurface(index: number) {
    this.newPackSurfaces.splice(index, 1);
  }

  // Methods for managing options in new pack
  addNewPackOption() {
    this.newPackOptions.push({ option_description: '' });
  }

  removeNewPackOption(index: number) {
    this.newPackOptions.splice(index, 1);
  }

  confirmAddPack() {
    if (this.selectedFile?.name) {
      // Create pack first without image, then upload and update
      const tempImg = this.newPack.img;
      this.newPack.img = '';

      // Create pack first, then upload image and create surfaces/options
      this.packService.createPack(this.newPack).subscribe((response: { message: string; pack_id: number }) => {
        const packId = response.pack_id;

        // Upload image file
        const originalName = this.selectedFile!.name;
        const extension = originalName.includes('.') ? originalName.split('.').pop() : '';

        this.fileService.uploadFile(this.selectedFile!, 'img/pack1', `${packId}`)
          .subscribe(() => {
            const imgPath = `${packId}.${extension}`;
            // Now update the pack with the image path
            this.packService.updatePack(packId, { ...this.newPack, img: imgPath }).subscribe(() => {
              this.createPackSurfacesAndOptions(packId);
            });
          });
      });
    } else {
      // Create pack without image
      this.packService.createPack(this.newPack).subscribe((response: { message: string; pack_id: number }) => {
        const packId = response.pack_id;
        this.createPackSurfacesAndOptions(packId);
      });
    }
  }

  private createPackSurfacesAndOptions(packId: number) {
    // Create surfaces
    const surfacePromises = this.newPackSurfaces
      .filter(surface => surface.surface && surface.prix)
      .map(surface =>
        this.packService.createSurface({
          surface: surface.surface!,
          prix: surface.prix!,
          id_pack1: packId
        }).toPromise()
      );

    // Create options
    const optionPromises = this.newPackOptions
      .filter(option => option.option_description && option.option_description.trim())
      .map(option =>
        this.packService.createOption({
          description: option.option_description!,
          id_pack1: packId
        }).toPromise()
      );

    // Wait for all surfaces and options to be created
    Promise.all([...surfacePromises, ...optionPromises]).then(() => {
      this.addPackDialogVisible = false;
      this.loadPacks();
      this.selectedFile = null;
    }).catch(error => {
      console.error('Error creating surfaces/options:', error);
      // Still close dialog and reload, but log the error
      this.addPackDialogVisible = false;
      this.loadPacks();
      this.selectedFile = null;
    });
  }

  private createPack() {
    this.packService.createPack(this.newPack).subscribe((response: { message: string; pack_id: number }) => {
      const packId = response.pack_id;
      this.createPackSurfacesAndOptions(packId);
    });
  }


  // ================= ADD OPTION =================
  onAddOption() {
    this.newOption = { id: 0, name: '', prix_ht: 0, qmax: 0, ordre: 0, description: '', img: '' };
    this.selectedFile = null;
    this.addOptionDialogVisible = true;
  }

  confirmAddOption() {
    if (this.selectedFile?.name) {
      // Include image filename in the initial option creation
      const originalName = this.selectedFile.name;
      this.newOption.img = originalName;

      // Create option with image filename
      this.optionService.createOption(this.newOption).subscribe((response: { message: string; id: number }) => {
        const optionId = response.id;
        if (optionId) {
          // Upload image file to option-specific folder
          this.fileService.uploadFile(this.selectedFile!, `img/option1s/${optionId}`, originalName.split('.')[0])
            .subscribe(() => {
              this.addOptionDialogVisible = false;
              this.loadOptions();
              this.selectedFile = null;
            });
        } else {
          console.error('Option ID is undefined in response:', response);
          this.addOptionDialogVisible = false;
          this.loadOptions();
          this.selectedFile = null;
        }
      });
    } else {
      this.createOption();
    }
  }

  private createOption() {
    this.optionService.createOption(this.newOption).subscribe(() => {
      this.addOptionDialogVisible = false;
      this.loadOptions();
      this.selectedFile = null;
    });
  }


}
