import { Component } from '@angular/core';
import OpenAI from 'openai';
import {from} from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CountriesService } from './services/countries.service';
//import { UsersService } from './services/users.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'suggest-it';
  //user$ = this.usersService.currentUserProfile$;

  constructor(
    public authService: AuthService,
    //public usersService: UsersService,
    private router: Router,
    private countriesService: CountriesService
  ) {
    this.countriesService.setApiKey();
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/']);
    });
  }

}
