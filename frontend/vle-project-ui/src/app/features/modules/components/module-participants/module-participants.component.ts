import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../users/models/user.model';
import { UserService } from '../../../users/services/user.service';
import { ModuleService } from '../../services/module.service';

@Component({
  selector: 'app-module-participants',
  templateUrl: './module-participants.component.html',
  styleUrls: ['./module-participants.component.scss']
})
export class ModuleParticipantsComponent implements OnInit {
  @Output() backToModuleDetails = new EventEmitter<void>();
  isAdmin$: Observable<boolean>;
  currentUser$!: Observable<User | null>;
  moduleId!: string;
  moduleTitle!: string;
  isModuleInstructor!: boolean;
  participants: User[] = [];
  filteredParticipants: User[] = [];
  displayedParticipants: User[] = [];
  searchQuery: string = '';
  isLoadingParticipants: boolean = false;

  pageSize = 5;
  pageSizeOptions = [5, 10, 25];
  pageIndex = 0;

  constructor(
    private authService: AuthService,
    private moduleService: ModuleService,
    private route: ActivatedRoute,
    private userService: UserService
  ) {
    this.isAdmin$ = this.authService.userRoles$.pipe(
      map(roles => roles.includes('Admin'))
    );

    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.moduleId = this.route.snapshot.paramMap.get('id')!;
    this.isLoadingParticipants = true;

    this.userService.getModuleParticipants(this.moduleId).subscribe(participants => {
      this.participants = participants;
      this.filteredParticipants = [...participants];
      this.updateDisplayedParticipants();

      this.isLoadingParticipants = false;
    });

    this.moduleService.getModuleById(this.moduleId).subscribe(module => {
      this.moduleTitle = module.moduleName;

      this.currentUser$.subscribe(currentUser => {
        this.isModuleInstructor = (module.moduleInstructor === currentUser?.userId);
      });
    });
  }

  downloadParticipants(): void {
    if (!this.participants || this.participants.length === 0) {
      console.warn('No participants to download.');
      return;
    }

    const csvData = this.participants.map(participant => ({
      ID: participant.userId,
      LastName: participant.lastName,
      FirstName: participant.firstName,
      Email: participant.email,
      Gender: participant.gender
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    const fileName = `${this.moduleTitle.replace(/\s+/g, '_')}_participants.csv`;
    link.href = url;
    link.setAttribute('download', fileName.toLowerCase());
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onSearch(): void {
    this.isAdmin$.subscribe(isAdmin => {
      this.filteredParticipants = this.participants.filter(participant =>
        (isAdmin || this.isModuleInstructor ?
          participant.userId.toLowerCase().includes(this.searchQuery.toLowerCase()) : false) ||
        participant.firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        participant.lastName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        participant.email.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    });

    this.pageIndex = 0;
    this.updateDisplayedParticipants();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateDisplayedParticipants();
  }

  private updateDisplayedParticipants(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.displayedParticipants = this.filteredParticipants.slice(start, end);
  }

  onBackToModuleDetail(): void {
    this.backToModuleDetails.emit();
  }
}
