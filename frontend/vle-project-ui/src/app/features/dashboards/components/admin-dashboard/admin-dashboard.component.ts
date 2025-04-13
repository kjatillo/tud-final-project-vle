import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { Observable, forkJoin } from 'rxjs';
import { Module } from '../../../modules/models/module.model';
import { AssignmentService } from '../../../modules/services/assignment.service';
import { EnrolmentService } from '../../../modules/services/enrolment.service';
import { ModuleService } from '../../../modules/services/module.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('enrolmentChart') enrolmentChartCanvas!: ElementRef;
  @ViewChild('assignmentDistributionChart') assignmentDistChartCanvas!: ElementRef;
  @ViewChild('priceDistributionChart') priceDistributionChartCanvas!: ElementRef;
  
  modules$: Observable<Module[]>;
  selectedModule = new FormControl('');
  
  totalModules = 0;
  totalenrolments = 0;
  averageModulePrice = 0;
  totalInstructors = 0;
  
  enrolmentChart: Chart | undefined;
  assignmentDistributionChart: Chart | undefined;
  priceDistributionChart: Chart | undefined;
  
  selectedModuleAnalytics = {
    totalenrolments: 0,
    averageGrade: 0,
    submissionCount: 0,
    completionRate: 0
  };

  constructor(
    private moduleService: ModuleService,
    private enrolmentService: EnrolmentService,
    private assignmentService: AssignmentService
  ) {
    this.modules$ = this.moduleService.getModules();
  }

  ngOnInit() {
    this.loadAnalytics();
    
    this.selectedModule.valueChanges.subscribe(moduleId => {
      if (!moduleId) return;
      this.loadModuleAnalytics(moduleId);
    });
  }

  ngAfterViewInit() {
    this.initializeCharts();
  }

  private loadAnalytics() {
    const currentYear = new Date().getFullYear();
    console.log('Loading analytics for year:', currentYear);
    
    forkJoin({
      modules: this.moduleService.getModules(),
      totalenrolments: this.enrolmentService.getTotalEnrolmentsCount(),
      monthlyTrends: this.enrolmentService.getMonthlyEnrolmentTrends(currentYear),
      assignmentStats: this.assignmentService.getAssignmentStats()
    }).subscribe(data => {
      const modules = data.modules;
      
      this.totalModules = modules.length;
      this.totalenrolments = data.totalenrolments;
      this.averageModulePrice = modules.reduce((sum, module) => sum + module.price, 0) / modules.length;
      this.totalInstructors = new Set(modules.map(m => m.moduleInstructor)).size;
      
      console.log('Monthly enrollment trends data:', data.monthlyTrends);
      this.updateCharts(modules, data.monthlyTrends, data.assignmentStats);
    });
  }

  private loadModuleAnalytics(moduleId: string) {
    forkJoin({
      enrolments: this.enrolmentService.getModuleEnrolmentsCount(moduleId),
      analytics: this.assignmentService.getModuleAnalytics(moduleId)
    }).subscribe(data => {
      this.selectedModuleAnalytics = {
        totalenrolments: data.enrolments,
        averageGrade: data.analytics.averageGrade,
        submissionCount: data.analytics.submissionCount,
        completionRate: data.analytics.completionRate
      };
    });
  }

  private initializeCharts() {
    // Initialize enrolment chart
    this.enrolmentChart = new Chart(this.enrolmentChartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Total enrolments',
          data: [],
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 6,
          pointHoverRadius: 8,
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
          title: {
            display: true,
            text: 'Enrolment Trends',
            padding: 20,
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            position: 'top',
            align: 'center'
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            title: {
              display: true,
              text: 'Month'
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            },
            title: {
              display: true,
              text: 'Total enrolments'
            }
          }
        },
        elements: {
          line: {
            borderJoinStyle: 'round'
          }
        }
      }
    });

    // Initialize price distribution chart
    this.priceDistributionChart = new Chart(this.priceDistributionChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Number of Modules',
          data: [],
          backgroundColor: 'rgb(75, 192, 192)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
          title: {
            display: true,
            text: 'Module Price Distribution',
            padding: 20,
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            position: 'top',
            align: 'center'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });

    // Initialize assignment distribution chart
    this.assignmentDistributionChart = new Chart(this.assignmentDistChartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Submitted', 'Not Submitted'],
        datasets: [{
          data: [],
          backgroundColor: [
            'rgb(75, 192, 192)',
            'rgb(255, 99, 132)'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
          title: {
            display: true,
            text: 'Assignment Submission Status',
            padding: 20,
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            position: 'top',
            align: 'center'
          }
        }
      }
    });
  }

  private updateCharts(modules: Module[], monthlyTrends: any[], assignmentStats: any) {
    // Update price distribution
    if (this.priceDistributionChart) {
      const priceRanges = this.calculatePriceDistribution(modules);
      this.priceDistributionChart.data.labels = priceRanges.map(r => r.label);
      this.priceDistributionChart.data.datasets[0].data = priceRanges.map(r => r.count);
      this.priceDistributionChart.update();
    }

    // Update assignment distribution
    if (this.assignmentDistributionChart) {
      this.assignmentDistributionChart.data.datasets[0].data = [
        assignmentStats.submitted,
        assignmentStats.unsubmitted
      ];
      this.assignmentDistributionChart.update();
    }

    // Update enrolment chart
    if (this.enrolmentChart && monthlyTrends?.length > 0) {
      this.enrolmentChart.data.labels = monthlyTrends.map(d => d.month);
      this.enrolmentChart.data.datasets[0].data = monthlyTrends.map(d => d.count);
      this.enrolmentChart.update();
    }
  }

  private calculatePriceDistribution(modules: Module[]) {
    const ranges = [
      { min: 0, max: 50, label: '€0-50', count: 0 },
      { min: 50, max: 100, label: '€50-100', count: 0 },
      { min: 100, max: 150, label: '€100-150', count: 0 },
      { min: 150, max: 200, label: '€150-200', count: 0 },
      { min: 200, max: Infinity, label: '€200+', count: 0 }
    ];

    modules.forEach(module => {
      const range = ranges.find(r => module.price >= r.min && module.price < r.max);
      if (range) range.count++;
    });

    return ranges;
  }
}
