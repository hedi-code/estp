import { Component } from '@angular/core';
import { LayoutService } from '../services/layout.service';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

  constructor(public layoutService:LayoutService){}

}
