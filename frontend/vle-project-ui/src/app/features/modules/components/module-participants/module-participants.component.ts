import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../users/services/user.service';
import { User } from '../../models/user.model';
import { ModuleService } from '../../services/module.service';

@Component({
  selector: 'app-module-participants',
  templateUrl: './module-participants.component.html',
  styleUrls: ['./module-participants.component.scss']
})
export class ModuleParticipantsComponent implements OnInit {
  @Output() backToModuleDetails = new EventEmitter<void>();
  moduleId!: string;
  moduleTitle!: string;
  participants: User[] = [];
  filteredParticipants: User[] = [];
  displayedParticipants: User[] = [];
  searchQuery: string = '';
  
  pageSize = 5;
  pageSizeOptions = [5, 10, 25];
  pageIndex = 0;

  constructor(
    private moduleService: ModuleService,
    private route: ActivatedRoute,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.moduleId = this.route.snapshot.paramMap.get('id')!;

    this.userService.getModuleParticipants(this.moduleId).subscribe(participants => {
      this.participants = participants;
      this.filteredParticipants = [...participants];
      this.updateDisplayedParticipants();
    });

    this.moduleService.getModuleById(this.moduleId).subscribe(module => {
      this.moduleTitle = module.moduleName;
    });
  }

  downloadParticipants(): void {
    if (!this.participants || this.participants.length === 0) {
      console.warn('No participants to download.');
      return;
    }
  
    const csvData = this.participants.map(participant => ({
      ID: participant.id,
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
    this.filteredParticipants = this.participants.filter(participant =>
      participant.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      participant.firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      participant.lastName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      participant.email.toLowerCase().includes(this.searchQuery.toLowerCase())
    );

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
