import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-verify-acccount',
  standalone: false,
  templateUrl: './verify-acccount.component.html',
  styleUrl: './verify-acccount.component.scss'
})
export class VerifyAcccountComponent {
  message = 'Email en cours de vérification...';

  constructor(private route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');
    this.authService.verifyAccount(token || '').subscribe(res =>{
      this.message = res.message
     
    });
  }
}
