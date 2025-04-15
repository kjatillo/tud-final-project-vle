import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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

  constructor(
    private moduleService: ModuleService,
    private route: ActivatedRoute,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.moduleId = this.route.snapshot.paramMap.get('id')!;

    this.userService.getModuleParticipants(this.moduleId).subscribe(participants => {
      this.participants = participants;
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

  onBackToModuleDetail(): void {
    this.backToModuleDetails.emit();
  }
}
