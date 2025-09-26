import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { DashboardService, DashboardStats } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  stats: DashboardStats | null = null;
  loading = true;

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

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
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
}
