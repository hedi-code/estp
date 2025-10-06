import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { DashboardService, DashboardStats } from '../../services/dashboard.service';
import { AuthCookieService } from '../../../../core/services/auth-cookie.service';
import { EntrepriseService } from '../../../entreprise/entreprise.service';
import { Entreprise } from '../../../entreprise/entreprise.model';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  stats: DashboardStats | null = null;
  loading = true;
  role: string = "";

  // Commercial specific data
  assignedEntreprises: Entreprise[] = [];
  paidBC1Count = 0;
  unpaidBC1Count = 0;
  paidBC2Count = 0;
  unpaidBC2Count = 0;
  totalBC1Count = 0;
  totalBC2Count = 0;
  paidBC1Total = 0;
  unpaidBC1Total = 0;
  paidBC2Total = 0;
  unpaidBC2Total = 0;
  totalBC1Total = 0;
  totalBC2Total = 0;
  commercialBC1Total = 0;
  commercialBC2Total = 0;

  // President specific data
  topBC1Options: any[] = [];
  topBC2Options: any[] = [];

  // Dialog for entreprises by option
  displayEntreprisesDialog = false;
  selectedOption: any = null;
  selectedBcType: 'BC1' | 'BC2' = 'BC1';
  entreprisesByOption: any[] = [];

  // Bar Chart for counts
  barChartData: ChartData<'bar'> = {
    labels: ['Books', 'BC1', 'BC2', 'Entreprises'],
    datasets: [
      {
        data: [0, 0, 0, 0],
        label: 'Nombre total',
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: 'Statistiques générales'
      }
    }
  };

  barChartType = 'bar' as const;

  // Pie Chart for amounts
  pieChartData: ChartData<'pie'> = {
    labels: ['BC1 Total HT', 'BC2 Total HT'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Répartition des montants HT'
      }
    }
  };

  pieChartType = 'pie' as const;

  // Doughnut Chart for BC distribution
  doughnutChartData: ChartData<'doughnut'> = {
    labels: ['BC1', 'BC2'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Répartition BC1 vs BC2'
      }
    }
  };

  doughnutChartType = 'doughnut' as const;

  constructor(
    private dashboardService: DashboardService,
    private authCookieService: AuthCookieService,
    private entrepriseService: EntrepriseService
  ) {}

  ngOnInit(): void {
    this.role = this.authCookieService.getRole() ?? "user";
    this.loadDashboardData();

    if (this.role === 'comm') {
      this.loadCommercialData();
    } else if (this.role === 'pres') {
      this.loadPresidentData();
    } else if (this.role === 'tres') {
      this.loadPresidentData();
    }
  }

  loadDashboardData(): void {
    this.loading = true;
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.updateCharts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  private updateCharts(): void {
    if (!this.stats) return;

    // Update bar chart
    this.barChartData.datasets[0].data = [
      this.stats.totalBooks,
      this.stats.totalBc1,
      this.stats.totalBc2,
      this.stats.totalEntreprises
    ];

    // Update pie chart
    this.pieChartData.datasets[0].data = [
      this.stats.totalBc1Amount,
      this.stats.totalBc2Amount
    ];

    // Update doughnut chart
    this.doughnutChartData.datasets[0].data = [
      this.stats.totalBc1,
      this.stats.totalBc2
    ];
  }

  loadCommercialData(): void {
    const userId = this.authCookieService.getUserId();
    if (!userId) return;

    // Load assigned enterprises
    this.entrepriseService.getAllEntreprises().subscribe({
      next: (entreprises) => {
        this.assignedEntreprises = entreprises.filter(e => e.commercial_id === Number(userId));
      },
      error: (err) => console.error('Error loading enterprises:', err)
    });

    // Load commercial-specific dashboard data
    this.dashboardService.getCommercialDashboardStats(Number(userId)).subscribe({
      next: (data) => {
        this.paidBC1Count = data.paidBC1Count;
        this.unpaidBC1Count = data.unpaidBC1Count;
        this.paidBC2Count = data.paidBC2Count;
        this.unpaidBC2Count = data.unpaidBC2Count;
        this.totalBC1Count = data.totalBC1Count;
        this.totalBC2Count = data.totalBC2Count;
        this.paidBC1Total = data.paidBC1Total;
        this.unpaidBC1Total = data.unpaidBC1Total;
        this.paidBC2Total = data.paidBC2Total;
        this.unpaidBC2Total = data.unpaidBC2Total;
        this.totalBC1Total = data.totalBC1Total;
        this.totalBC2Total = data.totalBC2Total;
        this.commercialBC1Total = data.commercialBC1Total;
        this.commercialBC2Total = data.commercialBC2Total;
      },
      error: (err) => console.error('Error loading commercial data:', err)
    });
  }

  loadPresidentData(): void {
    // Load top options data
    this.dashboardService.getTopOptions().subscribe({
      next: (data) => {
        this.topBC1Options = data.topBC1Options;
        this.topBC2Options = data.topBC2Options;
      },
      error: (err) => console.error('Error loading president data:', err)
    });
  }

  showEntreprisesByOption(option: any, bcType: 'BC1' | 'BC2'): void {
    this.selectedOption = option;
    this.selectedBcType = bcType;
    this.displayEntreprisesDialog = true;

    // Load entreprises for this option
    this.dashboardService.getEntreprisesByOption(option.option_id, bcType).subscribe({
      next: (entreprises) => {
        this.entreprisesByOption = entreprises;
      },
      error: (err) => {
        console.error('Error loading entreprises by option:', err);
        this.entreprisesByOption = [];
      }
    });
  }
}
