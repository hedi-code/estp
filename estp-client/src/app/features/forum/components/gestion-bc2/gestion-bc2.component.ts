import { Component, OnInit } from '@angular/core';
import { Option2Service } from '../../services/option2.service';
import { Option2CategoriesService } from '../../services/option2-categories.service';
import { Option2, Option2Category, NewOption2, NewOption2Category } from '../../models/commande2.model';
import { environment } from '../../../../../environments/environment';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FileService } from '../../../../core/services/file.service';

@Component({
  selector: 'app-gestion-bc2',
  standalone: false,
  templateUrl: './gestion-bc2.component.html',
  styleUrl: './gestion-bc2.component.scss'
})
export class GestionBc2Component implements OnInit {

  baseUrl: String = environment.apiUrl;
  categories: Option2Category[] = [];
  options: Option2[] = [];
  activeIndex: number = 0;
  optionsTabActiveIndex: number = 0;
  imageTimestamp: number = Date.now();

  // Option dialogs
  selectedOption!: Option2;
  editOptionDialogVisible: boolean = false;
  createOptionDialogVisible: boolean = false;
  newOption: NewOption2 = this.initNewOption();

  // Category dialogs
  selectedCategory!: Option2Category;
  editCategoryDialogVisible: boolean = false;
  createCategoryDialogVisible: boolean = false;
  newCategory: NewOption2Category = this.initNewCategory();

  selectedFile: File | null = null;

  constructor(
    private option2Service: Option2Service,
    private option2CategoriesService: Option2CategoriesService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadOptions();
  }

  // ================= LOAD DATA =================
  loadCategories() {
    this.option2CategoriesService.getAllOption2Categories().subscribe(data => {
      this.categories = data;
    });
  }

  loadOptions() {
    this.option2Service.getAllOption2s().subscribe(data => {
      this.options = data;
      this.imageTimestamp = Date.now(); // Update timestamp to bust cache
    });
  }

  // ================= OPTION CRUD =================

  // Create Option
  openCreateOptionDialog() {
    this.newOption = this.initNewOption();
    this.selectedFile = null;
    this.createOptionDialogVisible = true;
  }

  confirmCreateOption() {
    if (this.selectedFile?.name) {
      // Create option first, then upload image
      this.option2Service.createOption2(this.newOption).subscribe((response: { message: string; id: number }) => {
        const optionId = response.id;
        this.uploadOptionImage(optionId, true, () => {
          this.createOptionDialogVisible = false;
          this.loadOptions();
          this.navigateToOptionCategory(this.newOption.category_id ?? null);
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Option créée avec succès' });
        });
      });
    } else {
      this.option2Service.createOption2(this.newOption).subscribe(() => {
        this.createOptionDialogVisible = false;
        this.loadOptions();
        this.navigateToOptionCategory(this.newOption.category_id ?? null);
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Option créée avec succès' });
      });
    }
  }

  // Edit Option
  onEditOption(option: Option2) {
    this.selectedOption = { ...option };
    this.selectedFile = null;
    this.editOptionDialogVisible = true;
  }

  confirmEditOption() {
    if (this.selectedFile?.name) {
      // Update the selectedOption.img with the new filename before calling updateOptionData
      const originalName = this.selectedFile.name;
      const extension = originalName.includes('.') ? originalName.split('.').pop() : '';
      const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
      const imgPath = `${nameWithoutExt}.${extension}`;

      this.uploadOptionImage(this.selectedOption.id, false, () => {
        // Update the img property so it doesn't get overwritten
        this.selectedOption.img = imgPath;
        this.updateOptionData();
      });
    } else {
      this.updateOptionData();
    }
  }

  private updateOptionData() {
    this.option2Service.updateOption2(this.selectedOption.id, this.selectedOption).subscribe(() => {
      this.editOptionDialogVisible = false;
      this.loadOptions();
      this.navigateToOptionCategory(this.selectedOption.category_id ?? null);
      this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Option modifiée avec succès' });
    });
  }

  // Delete Option
  onDeleteOption(option: Option2) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de supprimer l'option "${option.nom}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.option2Service.deleteOption2(option.id).subscribe(() => {
          this.loadOptions();
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Option supprimée avec succès' });
        });
      }
    });
  }

  // ================= CATEGORY CRUD =================

  // Create Category
  openCreateCategoryDialog() {
    this.newCategory = this.initNewCategory();
    this.createCategoryDialogVisible = true;
  }

  confirmCreateCategory() {
    this.option2CategoriesService.createOption2Category(this.newCategory).subscribe(() => {
      this.createCategoryDialogVisible = false;
      this.loadCategories();
      this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Catégorie créée avec succès' });
    });
  }

  // Edit Category
  onEditCategory(category: Option2Category) {
    this.selectedCategory = { ...category };
    this.editCategoryDialogVisible = true;
  }

  confirmEditCategory() {
    this.option2CategoriesService.updateOption2Category(this.selectedCategory.id, this.selectedCategory).subscribe(() => {
      this.editCategoryDialogVisible = false;
      this.loadCategories();
      this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Catégorie modifiée avec succès' });
    });
  }

  // Delete Category
  onDeleteCategory(category: Option2Category) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de supprimer la catégorie "${category.name}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.option2CategoriesService.deleteOption2Category(category.id).subscribe(() => {
          this.loadCategories();
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Catégorie supprimée avec succès' });
        });
      }
    });
  }

  // ================= FILE UPLOAD =================
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Don't modify img path - it will be set after upload completes
    }
  }

  private uploadOptionImage(optionId: number, isCreate: boolean, callback: () => void) {
    if (!this.selectedFile) {
      console.log('No file selected, skipping upload');
      callback();
      return;
    }

    const originalName = this.selectedFile.name;
    console.log('Uploading file:', originalName);
    const extension = originalName.includes('.') ? originalName.split('.').pop() : '';
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    console.log('Name without extension:', nameWithoutExt, 'Extension:', extension);

    const folder = `img%2Foption2s%2F${optionId}`;
    console.log('Upload folder:', folder);

    this.fileService.uploadFile(this.selectedFile, folder, nameWithoutExt)
      .subscribe({
        next: (uploadResponse) => {
          console.log('File upload successful, response:', uploadResponse);
          const imgPath = `${nameWithoutExt}.${extension}`;
          console.log('Updating database with image path:', imgPath);

          // Always update the database with the image path after upload
          this.option2Service.updateOption2(optionId, { img: imgPath }).subscribe({
            next: (updateResponse) => {
              console.log('Database update successful:', updateResponse);
              console.log('Image path updated in database:', imgPath);
              callback();
            },
            error: (err) => {
              console.error('Error updating image path in database:', err);
              console.error('Full error object:', JSON.stringify(err, null, 2));
              this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de la mise à jour du chemin de l\'image'
              });
              callback();
            }
          });
        },
        error: (err) => {
          console.error('Error uploading file:', err);
          console.error('Full upload error:', JSON.stringify(err, null, 2));
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Erreur lors de l\'upload de l\'image'
          });
          callback();
        }
      });
  }

  // ================= HELPERS =================
  private initNewOption(): NewOption2 {
    return {
      category_id: null,
      nom: '',
      coloris: null,
      dispo_si: null,
      img: null,
      prix_ht: 0,
      taux_tva: 20,
      qmax: 1,
      description: null,
      ordre: 0,
      multiple: false
    };
  }

  private initNewCategory(): NewOption2Category {
    return {
      name: ''
    };
  }

  getCategoryName(categoryId: number | null): string {
    if (!categoryId) return 'Sans catégorie';
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Catégorie inconnue';
  }

  getOptionsByCategory(categoryId: number | null): Option2[] {
    if (categoryId === null) {
      return this.options.filter(option => option.category_id === null || option.category_id === undefined);
    }
    return this.options.filter(option => option.category_id === categoryId);
  }

  // Navigate to the appropriate tab after creating/updating an option
  navigateToOptionCategory(categoryId: number | null) {
    if (categoryId === null) {
      // Navigate to "Sans catégorie" tab (last tab)
      this.optionsTabActiveIndex = this.categories.length;
    } else {
      // Find the index of the category in the tabs
      const categoryIndex = this.categories.findIndex(cat => cat.id === categoryId);
      if (categoryIndex !== -1) {
        this.optionsTabActiveIndex = categoryIndex;
      }
    }
  }
}
