import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  decoreImagePath: string = 'assets/img/Decore.png'
  decoreBlueImagePath: string = 'assets/img/Decore2.png'

  constructor(public authService: AuthService) {}
}
