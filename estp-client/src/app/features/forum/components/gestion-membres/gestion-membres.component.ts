import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

interface RoleOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-gestion-membres',
  standalone: false,
  templateUrl: './gestion-membres.component.html',
  styleUrl: './gestion-membres.component.scss'
})
export class GestionMembresComponent implements OnInit {
  members: User[] = [];
  loading = false;

  roleOptions: RoleOption[] = [
    { label: 'Président', value: 'pres' },
    { label: 'Trésorier', value: 'tres' },
    { label: 'Responsable commercial', value: 'rescom' },
    { label: 'Commercial', value: 'comm' },
    { label: 'Responsable logistique', value: 'reslog' },
    { label: 'Responsable plan', value: 'resplan' },
    { label: 'Responsable book', value: 'resbook' },
    { label: 'Responsable communication', value: 'rescommu' },
    { label: 'Community manager', value: 'comman' }
  ];

  editDialogVisible = false;
  selectedMember!: User;

  addDialogVisible = false;
  newMember: Partial<User> & { password?: string } = this.emptyMember();

  passwordDialogVisible = false;
  passwordTarget: User | null = null;
  newPassword = '';

  constructor(
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.loading = true;
    this.userService.getMembers().subscribe({
      next: (data) => {
        this.members = data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getRoleLabel(role: string): string {
    return this.roleOptions.find(r => r.value === role)?.label || role;
  }

  // ===== Edit =====
  onEdit(member: User) {
    this.selectedMember = { ...member };
    this.editDialogVisible = true;
  }

  confirmEdit() {
    if (!this.selectedMember) return;
    const payload = {
      first_name: this.selectedMember.first_name,
      last_name: this.selectedMember.last_name,
      email: this.selectedMember.email,
      role: this.selectedMember.role
    };
    this.userService.updateMember(this.selectedMember.id, payload).subscribe({
      next: () => {
        this.editDialogVisible = false;
        this.loadMembers();
      }
    });
  }

  // ===== Add =====
  onAdd() {
    this.newMember = this.emptyMember();
    this.addDialogVisible = true;
  }

  confirmAdd() {
    this.userService.createMember(this.newMember).subscribe({
      next: () => {
        this.addDialogVisible = false;
        this.loadMembers();
      }
    });
  }

  // ===== Delete =====
  onDelete(member: User) {
    this.confirmationService.confirm({
      message: `Supprimer le membre ${member.first_name} ${member.last_name} ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.userService.delete(member.id).subscribe({
          next: () => this.loadMembers()
        });
      }
    });
  }

  // ===== Reset password =====
  onResetPassword(member: User) {
    this.passwordTarget = member;
    this.newPassword = '';
    this.passwordDialogVisible = true;
  }

  confirmResetPassword() {
    if (!this.passwordTarget) return;
    this.userService.resetMemberPassword(this.passwordTarget.id, this.newPassword).subscribe({
      next: () => {
        this.passwordDialogVisible = false;
        this.passwordTarget = null;
        this.newPassword = '';
      }
    });
  }

  private emptyMember(): Partial<User> & { password?: string } {
    return {
      first_name: '',
      last_name: '',
      email: '',
      role: 'comm',
      password: '',
      step: 0,
      verified: true
    };
  }
}
