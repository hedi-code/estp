import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { Config } from '../../models/config.model';
import { MessageService } from 'primeng/api';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-config',
  standalone: false,
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {
  configs: Config[] = [];
  editDialogVisible: boolean = false;
  selectedConfig: Config | null = null;
  selectedFile: File | null = null;
  baseUrl: string = environment.apiUrl;

  constructor(
    private configService: ConfigService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadConfigs();
  }

  loadConfigs(): void {
    this.configService.getAllConfigs().subscribe({
      next: (data) => {
        this.configs = data;
      },
      error: (err) => {
        console.error('Error loading configs:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des configurations'
        });
      }
    });
  }

  openEditDialog(config: Config): void {
    this.selectedConfig = { ...config };
    this.selectedFile = null;
    this.editDialogVisible = true;
  }

  closeEditDialog(): void {
    this.editDialogVisible = false;
    this.selectedConfig = null;
    this.selectedFile = null;
  }

  onFileSelect(event: any): void {
    const file = event.files[0];
    if (file) {
      // Validate that it's a PDF
      if (file.type !== 'application/pdf') {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Le fichier doit être un PDF'
        });
        return;
      }
      this.selectedFile = file;
    }
  }

  isFileUploadConfig(configName: string): boolean {
    return configName === 'fiche_sps' || configName === 'dossier_technique_standiste';
  }

  saveConfig(): void {
    if (!this.selectedConfig) return;

    // If it's a file upload config and a file is selected
    if (this.isFileUploadConfig(this.selectedConfig.config_name) && this.selectedFile) {
      this.configService.uploadConfigFile(this.selectedConfig.config_name, this.selectedFile).subscribe({
        next: (response) => {
          // Update the config with the new filename
          const updateData = {
            config_value: response.filename,
            description: this.selectedConfig!.description
          };
          this.configService.updateConfig(this.selectedConfig!.id!, updateData).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Configuration mise à jour avec succès'
              });
              this.loadConfigs();
              this.closeEditDialog();
            },
            error: (err) => {
              console.error('Error updating config:', err);
              this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de la mise à jour de la configuration'
              });
            }
          });
        },
        error: (err) => {
          console.error('Error uploading file:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Erreur lors du téléchargement du fichier'
          });
        }
      });
    } else {
      // Regular text config update
      const updateData = {
        config_value: this.selectedConfig.config_value,
        description: this.selectedConfig.description
      };
      this.configService.updateConfig(this.selectedConfig.id!, updateData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Configuration mise à jour avec succès'
          });
          this.loadConfigs();
          this.closeEditDialog();
        },
        error: (err) => {
          console.error('Error updating config:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Erreur lors de la mise à jour de la configuration'
          });
        }
      });
    }
  }
}
